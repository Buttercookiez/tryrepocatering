const db = require("../firestore/firebase"); 
const admin = require("firebase-admin"); 
const nodemailer = require("nodemailer");

// --- CONFIG: Email Transporter ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

// --- 1. CREATE INQUIRY ---
const createInquiry = async (req, res) => {
    try {
        const data = req.body;

        // Generate Custom Reference ID (BK-001)
        const snapshot = await db.collection("inquiries")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        let newNumber = 1;

        if (!snapshot.empty) {
            const lastDoc = snapshot.docs[0].data();
            if (lastDoc.refId) {
                const lastRefId = lastDoc.refId;
                const lastNumber = parseInt(lastRefId.split("-")[1]);
                if (!isNaN(lastNumber)) newNumber = lastNumber + 1;
            }
        }

        const formattedNumber = newNumber.toString().padStart(3, "0");
        const refId = `BK-${formattedNumber}`;

        const batch = db.batch();
        const inquiryRef = db.collection("inquiries").doc(); 
        
        batch.set(inquiryRef, {
            refId: refId,
            fullName: data.name,
            email: data.email,
            phone: data.phone,
            dateOfEvent: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            estimatedGuests: parseInt(data.guests) || 0,
            estimatedBudget: parseFloat(data.budget) || 0,
            eventType: data.eventType,
            serviceStyle: data.serviceStyle,
            venueName: data.venue,          
            venueId: data.venueId,          
            venueType: data.venueType,      
            initialNotes: data.notes,
            status: "Pending",
            createdAt: new Date().toISOString()
        });

        // Initialize empty documents
        const paymentsRef = db.collection("payments").doc(refId);
        batch.set(paymentsRef, {
            refId: refId,
            linkedInquiryId: inquiryRef.id,
            totalCost: null,
            reservationFee: null,
            downpayment: null,
            balance: null,
            paymentStatus: "Unpaid",
            history: []
        });

        const proposalsRef = db.collection("proposals").doc(refId);
        batch.set(proposalsRef, {
            refId: refId,
            linkedInquiryId: inquiryRef.id,
            selectedPackage: null,
            items: [],
            costBreakdown: { food: null, serviceCharge: null, grandTotal: null },
            isApproved: false
        });

        const notesRef = db.collection("notes").doc(refId);
        batch.set(notesRef, {
            refId: refId,
            linkedInquiryId: inquiryRef.id,
            internalNotes: null,
            timeline: [{ date: new Date().toISOString().split('T')[0], user: "System", action: "Inquiry Received" }]
        });

        await batch.commit();

        res.status(200).json({ success: true, refId: refId, message: "Inquiry created successfully!" });

    } catch (error) {
        console.error("Error saving inquiry:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 2. GET INQUIRY DETAILS ---
const getInquiryDetails = async (req, res) => {
    try {
        const { refId } = req.params; 
        const inquirySnapshot = await db.collection("inquiries").where("refId", "==", refId).limit(1).get();

        if (inquirySnapshot.empty) {
            return res.status(404).json({ success: false, message: "Inquiry not found" });
        }

        const inquiryData = inquirySnapshot.docs[0].data();
        const docId = inquirySnapshot.docs[0].id; 

        const [paymentSnap, proposalSnap, notesSnap] = await Promise.all([
            db.collection("payments").doc(refId).get(),
            db.collection("proposals").doc(refId).get(),
            db.collection("notes").doc(refId).get()
        ]);

        const combinedData = {
            id: docId, 
            ...inquiryData, 
            payment: paymentSnap.exists ? paymentSnap.data() : {},
            proposal: proposalSnap.exists ? proposalSnap.data() : {},
            notes: notesSnap.exists ? notesSnap.data() : {}
        };

        res.status(200).json(combinedData);

    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 3. GET BOOKING LIST ---
const getBooking = async (req, res) => {
    try {
        const snapshot = await db.collection('inquiries').orderBy("createdAt", "desc").get();
        const inquiries = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                refId: data.refId,
                fullName: data.fullName,
                dateOfEvent: data.dateOfEvent,
                eventType: data.eventType,
                estimatedGuests: data.estimatedGuests,
                venueName: data.venueName,
                status: data.status 
            };
        });
        res.json(inquiries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
};

// --- 4. SEND INITIAL PROPOSAL EMAIL ---
const sendProposalEmail = async (req, res) => {
    const { clientEmail, clientName, refId, totalCost, breakdown, details } = req.body;
    
    // --- FIX IS HERE: HARDCODED LIVE URL ---
    const FRONTEND_URL = "https://tryrepocatering.vercel.app"; 
    const viewLink = `${FRONTEND_URL}/client-proposal/${refId}`;

    try {
        const inquiryQuery = await db.collection("inquiries").where("refId", "==", refId).get();
        if (!inquiryQuery.empty) await inquiryQuery.docs[0].ref.update({ status: "Reviewing" });

        await db.collection("proposals").doc(refId).update({
            costBreakdown: { grandTotal: totalCost, menuPrice: breakdown.menuPrice, serviceCharge: breakdown.serviceCharge }
        });

        await db.collection("notes").doc(refId).update({
            timeline: admin.firestore.FieldValue.arrayUnion({
                date: new Date().toISOString().split('T')[0],
                user: "Admin",
                action: `Proposal Sent (Status: Reviewing)`
            })
        });

        // STANDARD PREMIUM PROPOSAL UI
        const htmlContent = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #1c1c1c; padding: 24px; text-align: center;">
                    <h2 style="color: #C9A25D; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-size: 18px;">Proposal Ready</h2>
                </div>
                <div style="padding: 32px 24px; background-color: #ffffff;">
                    <p style="font-size: 16px; margin-bottom: 24px;">Hi <strong>${clientName}</strong>,</p>
                    <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
                        Thank you for considering Mapos Catering. We have curated a set of menu options perfectly suited for your <strong>${details.eventType || 'Event'}</strong> on <strong>${details.date}</strong>.
                    </p>
                    <div style="background-color: #f9fafb; border-left: 4px solid #C9A25D; padding: 16px; margin-bottom: 32px;">
                        <p style="margin: 0; color: #374151;"><strong>Est. Headcount:</strong> ${details.guests}</p>
                        <p style="margin: 5px 0 0; color: #374151;"><strong>Proposed Cost:</strong> ~ ₱${totalCost ? totalCost.toLocaleString() : 'TBD'}</p>
                    </div>
                    <div style="text-align: center;">
                        <a href="${viewLink}" style="display: inline-block; background-color: #C9A25D; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">
                            View Full Menu & Prices
                        </a>
                    </div>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; text-align: center;">This link expires in 7 days.</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Mapos Catering" <${process.env.EMAIL_USER}>`,
            to: clientEmail, 
            subject: `Event Proposal: ${clientName} - ${refId}`,
            html: htmlContent
        });

        res.status(200).json({ success: true, message: "Proposal sent successfully" });

    } catch (error) {
        console.error("Proposal Send Error:", error);
        res.status(500).json({ success: false, message: "Failed to send email." });
    }
};

// --- 5. SEND FINAL CONTRACT & PAYMENT LINK (UPDATED UI) ---
const sendFinalQuotation = async (req, res) => {
    const { 
        refId, 
        clientEmail, 
        clientName, 
        paymentLink, 
        financials, // { grandTotal, downpayment, balance }
        eventSummary
    } = req.body;

    try {
        // A. Database Updates
        const inquiryQuery = await db.collection("inquiries").where("refId", "==", refId).get();
        if (!inquiryQuery.empty) await inquiryQuery.docs[0].ref.update({ status: "Contract Sent" });

        await db.collection("payments").doc(refId).update({
            totalCost: financials.grandTotal,
            downpayment: financials.downpayment,
            balance: financials.balance,
            paymentStatus: "Payment Pending",
            paymentLinkGenerated: true,
            lastLinkSent: new Date().toISOString()
        });

        await db.collection("notes").doc(refId).update({
            timeline: admin.firestore.FieldValue.arrayUnion({
                date: new Date().toISOString().split('T')[0],
                user: "Admin",
                action: `Sent Contract & Payment Link (Due: ₱${financials.downpayment})`
            })
        });

        // B. Generate HTML Email (MATCHING PROPOSAL STYLE)
        const htmlContent = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <!-- HEADER (Black & Gold) -->
                <div style="background-color: #1c1c1c; padding: 24px; text-align: center;">
                    <h2 style="color: #C9A25D; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-size: 18px;">
                        Contract & Payment
                    </h2>
                </div>

                <!-- BODY -->
                <div style="padding: 32px 24px; background-color: #ffffff;">
                    <p style="font-size: 16px; margin-bottom: 24px; color: #1f2937;">Hello <strong>${clientName}</strong>,</p>
                    <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
                        Your official contract for the event on <strong>${eventSummary.date}</strong> is ready. To finalize your booking and secure the date, please review the quotation and settle the required downpayment.
                    </p>
                    
                    <!-- FINANCIAL SUMMARY BOX (Matching Proposal Style) -->
                    <div style="background-color: #f9fafb; border-left: 4px solid #C9A25D; padding: 20px; margin-bottom: 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="padding-bottom: 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Grand Total Contract</td>
                                <td style="padding-bottom: 8px; text-align: right; color: #111827; font-weight: bold;">₱ ${Number(financials.grandTotal).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="padding-top: 8px; border-top: 1px dashed #d1d5db; color: #92400e; font-size: 13px; font-weight: bold;">DOWNPAYMENT DUE</td>
                                <td style="padding-top: 8px; border-top: 1px dashed #d1d5db; text-align: right; color: #b45309; font-weight: bold; font-size: 18px;">₱ ${Number(financials.downpayment).toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- CALL TO ACTION BUTTON (Gold) -->
                    <div style="text-align: center; margin-bottom: 32px;">
                        <a href="${paymentLink}" 
                           target="_blank"
                           style="display: inline-block; background-color: #C9A25D; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; box-shadow: 0 4px 6px rgba(201, 162, 93, 0.2);">
                           Review & Pay Securely
                        </a>
                        <p style="margin-top: 16px; font-size: 11px; color: #9ca3af;">
                            Secure transaction powered by PayMongo (GCash, Maya, Cards)
                        </p>
                    </div>

                    <div style="border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                            The remaining balance of <strong>₱ ${Number(financials.balance).toLocaleString()}</strong> will be due 1 week before the event.
                        </p>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
                    &copy; 2025 Mapos Catering Services
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Mapos Finance" <${process.env.EMAIL_USER}>`,
            to: clientEmail, 
            subject: `Action Required: Contract Payment for ${refId}`,
            html: htmlContent
        });

        res.status(200).json({ success: true, message: "Payment link and Contract sent." });

    } catch (error) {
        console.error("Contract Email Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 6. DECLINE INQUIRY ---
const declineInquiry = async (req, res) => {
    const { refId, email, reason } = req.body;

    try {
        const inquiryRef = db.collection("inquiries").where("refId", "==", refId);
        const snapshot = await inquiryRef.get();

        if (snapshot.empty) return res.status(404).json({ success: false, message: "Inquiry not found" });

        const docId = snapshot.docs[0].id;
        
        await db.collection("inquiries").doc(docId).update({
            status: "Declined",
            rejectionReason: reason,
            declinedAt: new Date().toISOString()
        });

        await db.collection("notes").doc(refId).update({
            timeline: admin.firestore.FieldValue.arrayUnion({
                date: new Date().toISOString().split('T')[0],
                user: "Admin",
                action: `Declined Inquiry. Reason: ${reason}`
            })
        });

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
                <h3 style="color: #333;">Regarding Inquiry ${refId}</h3>
                <p>We appreciate your interest in Mapos Catering.</p>
                <p>However, we are unable to accommodate your event on the requested date/specifications due to: <strong>${reason}</strong>.</p>
                <p>We apologize for the inconvenience.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Mapos Catering" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Update regarding Inquiry ${refId}`,
            html: htmlContent
        });

        res.status(200).json({ success: true, message: "Inquiry declined." });

    } catch (error) {
        console.error("Decline Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 7. CLIENT ACCEPTS PROPOSAL ---
const acceptProposal = async (req, res) => {
    const { refId, selectedPackageId, addOns, totalCost } = req.body;

    try {
        const inquiryQuery = await db.collection("inquiries").where("refId", "==", refId).get();
        if (inquiryQuery.empty) return res.status(404).json({ error: "Inquiry not found" });

        const docId = inquiryQuery.docs[0].id;

        await db.collection("inquiries").doc(docId).update({ status: "Proposal Accepted" });
        
        await db.collection("proposals").doc(refId).update({
            clientSelectedPackage: selectedPackageId,
            clientSelectedAddOns: addOns,
            finalAgreedAmount: totalCost,
            isApproved: true,
            approvedAt: new Date().toISOString()
        });

        await db.collection("notes").doc(refId).update({
            timeline: admin.firestore.FieldValue.arrayUnion({
                date: new Date().toISOString().split('T')[0],
                user: "Client",
                action: `Proposal Accepted. Waiting for Contract.`
            })
        });

        res.status(200).json({ success: true, message: "Proposal accepted" });

    } catch (error) {
        console.error("Accept Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    createInquiry, 
    getInquiryDetails, 
    getBooking, 
    sendProposalEmail,
    sendFinalQuotation,
    declineInquiry,
    acceptProposal
};

// Fixed URL for Vercel deployment
