// backend/controllers/inventoryController.js
const db = require("../firestore/firebase");

// Helper to clean IDs
const cleanID = (id) => (id ? String(id).trim().toUpperCase() : "");

// --- 1. GET INVENTORY ---
const getInventory = async (req, res) => {
  try {
    const snapshot = await db.collection("inventory_assets").get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    console.error("Inventory Error:", error);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

// --- 2. ADD SINGLE ASSET ---
const addAsset = async (req, res) => {
  try {
    const newItem = req.body;
    if (!newItem.name || !newItem.quantity) {
      return res.status(400).json({ message: "Name and Quantity are required" });
    }
    const docRef = await db.collection("inventory_assets").add(newItem);
    res.status(201).json({ id: docRef.id, message: "Asset added successfully" });
  } catch (error) {
    console.error("Add Asset Error:", error);
    res.status(500).json({ message: "Failed to add asset" });
  }
};

// --- 3. UPDATE ASSET (Stock OR Details) ---
// This now handles both quantity updates AND editing details
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Can contain quantity, name, category, etc.
    
    await db.collection("inventory_assets").doc(id).update(updates);
    
    res.status(200).json({ message: "Asset updated successfully" });
  } catch (error) {
    console.error("Update Asset Error:", error);
    res.status(500).json({ message: "Failed to update asset" });
  }
};

// --- 4. DELETE ASSET (NEW) ---
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("inventory_assets").doc(id).delete();
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Delete Asset Error:", error);
    res.status(500).json({ message: "Failed to delete asset" });
  }
};

// --- 5. GET ALLOCATION EVENTS ---
const getAllocationEvents = async (req, res) => {
  try {
    const { date } = req.query; 
    let query = db.collection("inquiries");
    if (date) query = query.where("dateOfEvent", "==", date);
    
    const inquiriesSnap = await query.get();
    const paymentsSnap = await db.collection("payments").get();
    const paidRefIds = new Set();
    
    paymentsSnap.forEach(doc => {
        const data = doc.data();
        if (data.refId && (Number(data.downpayment) > 0 || data.paymentStatus === 'Paid')) {
            paidRefIds.add(cleanID(data.refId));
        }
    });
    
    const events = [];
    inquiriesSnap.forEach(doc => {
        const data = doc.data();
        const refId = cleanID(data.refId);
        const isConfirmed = data.status === "Confirmed" || data.status === "Proposal Accepted" || paidRefIds.has(refId);

        if (isConfirmed) {
            let pkgId = 2; 
            if (data.eventType === "Private Dinner" || Number(data.estimatedBudget) >= 150000) pkgId = 3;

            events.push({
                id: doc.id,
                client: data.fullName,
                date: data.dateOfEvent,
                guests: Number(data.estimatedGuests),
                eventType: data.eventType,
                packageId: pkgId,
                isAllocated: data.isAllocated || false 
            });
        }
    });
    res.status(200).json(events);
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// --- 6. AUTO-DEDUCT ASSETS ---
const allocateAssetsForEvent = async (req, res) => {
    const { eventId, guests, packageId } = req.body;
    try {
        const baseItems = [
            { name: 'Dinner Plate', perGuest: 1 },
            { name: 'Fork', perGuest: 2 },
            { name: 'Spoon', perGuest: 2 },
            { name: 'Water Goblet', perGuest: 1 },
            { name: 'Tiffany Chair', perGuest: 1 },
            { name: 'Round Table (10pax)', perGuest: 0.1 },
            { name: 'Table Cloth (White)', perGuest: 0.1 }
        ];
        if (packageId === 3) baseItems.push({ name: 'Wine Glass', perGuest: 1 });

        const batch = db.batch();
        const inventorySnap = await db.collection("inventory_assets").get();
        
        inventorySnap.forEach(doc => {
            const item = doc.data();
            const rule = baseItems.find(r => item.name.includes(r.name));
            if (rule) {
                const deductAmount = Math.ceil(rule.perGuest * guests);
                const newQty = Math.max(0, Number(item.quantity) - deductAmount);
                batch.update(doc.ref, { quantity: newQty });
            }
        });

        batch.update(db.collection("inquiries").doc(eventId), { isAllocated: true });
        await batch.commit();
        res.status(200).json({ message: "Assets allocated!" });
    } catch (error) {
        console.error("Allocation Error:", error);
        res.status(500).json({ message: "Failed to allocate" });
    }
};

// --- 7. SEED ASSETS ---
const seedAssets = async (req, res) => {
    try {
        const assets = [
            { name: 'Tiffany Chair', category: 'Furniture', quantity: 500, unit: 'Pcs', threshold: 50 },
            { name: 'Round Table (10pax)', category: 'Furniture', quantity: 50, unit: 'Pcs', threshold: 5 },
            { name: 'Dinner Plate', category: 'Dining', quantity: 1000, unit: 'Pcs', threshold: 200 },
        ];
        const batch = db.batch();
        const oldSnap = await db.collection("inventory_assets").get();
        oldSnap.docs.forEach(doc => batch.delete(doc.ref));
        assets.forEach(item => batch.set(db.collection("inventory_assets").doc(), item));
        await batch.commit();
        res.status(200).json({ message: "Assets Seeded" });
    } catch (error) {
        res.status(500).json({ message: "Seeding failed" });
    }
};

module.exports = { 
    getInventory, 
    addAsset, 
    updateAsset, // Renamed from updateStock
    deleteAsset, // New
    getAllocationEvents, 
    allocateAssetsForEvent, 
    seedAssets 
};