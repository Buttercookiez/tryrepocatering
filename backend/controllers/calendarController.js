// backend/controllers/calendarController.js

// ✅ CORRECT IMPORT: Matches 'module.exports = db' from your firebase.js
const db = require("../firestore/firebase"); 

// Helper to clean IDs (removes spaces, makes uppercase for comparison)
const cleanID = (id) => (id ? String(id).trim().toUpperCase() : "");

// --- GET ALL EVENTS (Inquiries + Blocked Dates) ---
const getCalendarEvents = async (req, res) => {
  try {
    console.log("----- CALENDAR: Fetching Data -----");

    // 1. Fetch Inquiries, Payments, and Blocked Dates simultaneously
    const [inquiriesSnap, paymentsSnap, blockedSnap] = await Promise.all([
      db.collection("inquiries").get(),
      db.collection("payments").get(),
      db.collection("blocked_dates").get() 
    ]);

    // 2. Build a Set of "Paid" Reference IDs
    const paidRefIds = new Set();
    
    paymentsSnap.forEach(doc => {
      const data = doc.data();
      const rawRefId = data.refId;
      const cleanRefId = cleanID(rawRefId);
      
      const downpayment = Number(data.downpayment || 0);
      const status = data.paymentStatus; // e.g., "Paid"

      // LOGIC: Confirmed if downpayment > 0 OR status is explicitly "Paid"
      if (cleanRefId && (downpayment > 0 || status === 'Paid')) {
        paidRefIds.add(cleanRefId);
      } 
    });

    const events = [];

    // 3. Process Inquiries
    inquiriesSnap.forEach((doc) => {
      const data = doc.data();
      const rawRefId = data.refId;
      const cleanRefId = cleanID(rawRefId);
      
      // Check if this ID exists in our Paid Set
      const isPaid = paidRefIds.has(cleanRefId);

      const dateString = data.dateOfEvent ? String(data.dateOfEvent).trim() : null;

      if (!dateString) {
        return; // Skip if no date
      }

      events.push({
        id: doc.id,
        refId: rawRefId,
        title: data.fullName || "Client",
        type: data.eventType || "General",
        date: dateString,
        time: data.startTime || "TBD",
        guests: data.estimatedGuests || 0,
        venue: data.venueId,
        // STATUS LOGIC: Gold if Paid, Blue if Pending
        status: isPaid ? 'Confirmed' : 'Pending', 
        isBlocked: false
      });
    });

    // 4. Blocked Dates
    blockedSnap.forEach((doc) => {
      const data = doc.data();
      if(data.date) {
        events.push({
          id: doc.id, // This ID is needed for unblocking (deleting)
          title: data.reason || "FULLY BOOKED",
          date: data.date, 
          type: 'Blocked',
          status: 'Blocked',
          isBlocked: true
        });
      }
    });

    res.status(200).json(events);

  } catch (error) {
    console.error("Controller Error (getCalendarEvents):", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// --- BLOCK A SPECIFIC DATE ---
const blockDate = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required" });

    await db.collection("blocked_dates").add({
      date,
      reason: reason || "Fully Booked",
      createdAt: new Date().toISOString()
    });
    
    console.log(`> Date Blocked: ${date}`);
    res.status(201).json({ message: "Date blocked successfully" });
  } catch (error) {
    console.error("Controller Error (blockDate):", error);
    res.status(500).json({ message: "Failed to block date" });
  }
};

// --- UNBLOCK A DATE (DELETE) ---
const unblockDate = async (req, res) => {
  try {
    const { id } = req.params; // Expecting the Firestore Document ID
    if (!id) return res.status(400).json({ message: "ID is required" });

    await db.collection("blocked_dates").doc(id).delete();
    
    console.log(`> Unblocked Document ID: ${id}`);
    res.status(200).json({ message: "Date unblocked successfully" });
  } catch (error) {
    console.error("Controller Error (unblockDate):", error);
    res.status(500).json({ message: "Failed to unblock date" });
  }
};

// Export using CommonJS to match your server.js
module.exports = {
  getCalendarEvents,
  blockDate,
  unblockDate
};