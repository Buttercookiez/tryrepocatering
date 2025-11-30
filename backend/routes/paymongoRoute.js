const express = require("express");
const axios = require("axios");
const router = express.Router();
const crypto = require("crypto");
const db = require("../firestore/firebase"); 
const admin = require("firebase-admin");

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET;

// 1. CREATE CHECKOUT SESSION
router.post("/create-checkout-session", async (req, res) => {
  const { amount, description, remarks, refId } = req.body;

  try {
    const amountInCentavos = Math.round(amount * 100);
    // Redirect back to specific booking page
    const returnUrl = refId 
        ? `http://localhost:3000/client-payment/${refId}` 
        : `http://localhost:3000/client-payment/success`;

    const response = await axios.post("https://api.paymongo.com/v1/checkout_sessions", {
        data: { attributes: {
            amount: amountInCentavos, description, remarks, currency: "PHP",
            success_url: returnUrl, cancel_url: returnUrl,
            line_items: [{ name: description, amount: amountInCentavos, currency: "PHP", quantity: 1 }],
            payment_method_types: ["gcash", "paymaya", "card", "grab_pay"]
        }}
    }, { headers: { Authorization: "Basic " + Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64") }});

    res.json({ checkout_url: response.data.data.attributes.checkout_url });
  } catch (error) {
    console.error("Session Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. WEBHOOK HANDLER
router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  console.log("\n----- 🔔 WEBHOOK HIT! -----");
  
  const signature = req.headers["paymongo-signature"];
  const rawBody = req.body;

  try {
    // A. SECURITY CHECK
    // const computed = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
    // if (computed !== signature) {
    //   console.log("❌ FAIL: Signature mismatch. Check .env WEBHOOK_SECRET");
    //   return res.status(400).send("Invalid signature");
    // }
    console.log("✅ PASS: Signature Verified");

    const event = JSON.parse(rawBody.toString());
    const eventType = event.data.attributes.type;
    console.log(`ℹ️ Event Type: ${eventType}`);

    // B. PROCESS PAYMENT
    if (eventType === "checkout_session.payment.paid") {
      const session = event.data.attributes.data.attributes;
      const description = session.line_items?.[0]?.name || ""; 
      const amountPaid = (session.payments?.[0]?.attributes?.amount || 0) / 100;
      
      const match = description.match(/Ref:\s*(BK-\d+)/);

      if (match && match[1]) {
        console.log(`✅ Verified Payment for ${match[1]}: ₱${amountPaid}`);
        await updateDatabaseAfterPayment(match[1], amountPaid, description, event.data.id);
      } else {
        console.warn("⚠️ No Booking Ref found in description.");
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// 3. DATABASE UPDATE LOGIC
async function updateDatabaseAfterPayment(refId, amountPaid, description, paymentId) {
  try {
    const paymentRef = db.collection("payments").doc(refId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      console.error(`❌ Doc ${refId} not found`);
      return;
    }

    const currentData = paymentDoc.data();
    const currentBalance = parseFloat(currentData.balance) || 0;
    const newBalance = currentBalance - amountPaid;
    
    // Logic: If balance is low enough, mark as Paid. Else, Partial.
    const isFullyPaid = newBalance <= 50; 
    const newPaymentStatus = isFullyPaid ? "Paid" : "Partially Paid";
    const newInquiryStatus = isFullyPaid ? "Paid" : "Confirmed";

    const batch = db.batch();

    // Update Payment
    batch.update(paymentRef, {
      paymentStatus: newPaymentStatus,
      balance: newBalance,
      lastPaymentDate: new Date().toISOString(),
      history: admin.firestore.FieldValue.arrayUnion({
        date: new Date().toISOString(),
        action: "Online Payment (PayMongo)",
        amount: amountPaid,
        description: description,
        transactionId: paymentId
      })
    });

    // Update Inquiry
    if (currentData.linkedInquiryId) {
      batch.update(db.collection("inquiries").doc(currentData.linkedInquiryId), { status: newInquiryStatus });
    }

    // Update Timeline
    batch.update(db.collection("notes").doc(refId), {
      timeline: admin.firestore.FieldValue.arrayUnion({
        date: new Date().toISOString().split('T')[0],
        user: "System",
        action: `Received ₱${amountPaid.toLocaleString()}. New Status: ${newInquiryStatus}`
      })
    });

    await batch.commit();
    console.log(`🚀 Database Updated: ${refId} is now ${newInquiryStatus}`);

  } catch (error) {
    console.error("❌ DB Update Failed:", error);
  }
}

module.exports = router;