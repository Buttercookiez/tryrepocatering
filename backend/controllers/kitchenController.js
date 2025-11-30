const db = require("../firestore/firebase");

// --- 1. GET ALL INVENTORY ---
const getInventory = async (req, res) => {
  try {
    const snapshot = await db.collection("inventory").get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

// --- 2. GET ADD-ONS ---
const getAddOns = async (req, res) => {
  try {
    const snapshot = await db.collection("addons").get();
    const addons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch add-ons" });
  }
};

// --- 3. GET MENUS ---
const getMenus = async (req, res) => {
    try {
        const snapshot = await db.collection("packages").get();
        const menus = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            menus[data.packageId] = { ...data, id: doc.id };
        });
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch menus" });
    }
};

// --- 4. GET ORDERS ---
const getKitchenOrders = async (req, res) => {
  try {
    const { date } = req.query; 
    if (!date) return res.status(400).json({ message: "Date required" });

    const snapshot = await db.collection("inquiries").where("dateOfEvent", "==", date).get();
    const orders = snapshot.docs.map(doc => {
        const data = doc.data();
        let pkgId = 2; 
        if (data.eventType === "Private Dinner" || Number(data.estimatedBudget) >= 150000) {
            pkgId = 3;
        }
        return {
            id: doc.id,
            refId: data.refId,
            client: data.fullName,
            guests: data.estimatedGuests,
            time: data.startTime || "TBD",
            venue: data.venueId, 
            type: data.eventType,
            packageId: pkgId 
        };
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// --- 5. ADD INGREDIENT ---
const addIngredient = async (req, res) => {
  try {
    const newItem = req.body;
    const docRef = await db.collection("inventory").add(newItem);
    res.status(201).json({ id: docRef.id, ...newItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to add" });
  }
};

// --- 6. UPDATE STOCK ---
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { current } = req.body;
    await db.collection("inventory").doc(id).update({ current });
    res.status(200).json({ message: "Stock updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update" });
  }
};

// --- 7. UPDATE PACKAGE (THIS WAS MISSING OR NOT EXPORTED) ---
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params; 
    const updatedData = req.body;

    if (!id) return res.status(400).json({ message: "ID required" });

    // Update Firestore
    await db.collection("packages").doc(id).update(updatedData);
    
    res.status(200).json({ message: "Package updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Failed to update package" });
  }
};

// --- 8. SEED MENUS ---
const seedMenus = async (req, res) => {
    try {
        const batch = db.batch();
        const packageSnap = await db.collection("packages").get();
        packageSnap.docs.forEach((doc) => batch.delete(doc.ref));

        const fullPackages = [
            {
                packageId: 1,
                name: "Classic Buffet",
                price: 1200,
                description: "A delightful spread of local and international favorites served buffet style.",
                menu: [
                    { category: "Main Course", items: [{ name: "Roast Beef with Mushroom", ingredients: [] }, { name: "Parmesan Crusted Fish", ingredients: [] }, { name: "Herb Roasted Chicken", ingredients: [] }] },
                    { category: "Desserts", items: [{ name: "Chocolate Brownies", ingredients: [] }, { name: "Panna Cotta", ingredients: [] }] }
                ]
            },
            {
                packageId: 2,
                name: "Premium Plated",
                price: 1800,
                description: "An elevated dining experience with sit-down plated service and premium cuts.",
                menu: [
                    { category: "Appetizers", items: [{ name: "Seared Scallops", ingredients: [] }] },
                    { category: "Main Course", items: [{ name: "Angus Beef Medallions", ingredients: [] }, { name: "Seared Norwegian Salmon", ingredients: [] }, { name: "Truffle Mushroom Risotto", ingredients: [] }] },
                    { category: "Desserts", items: [{ name: "Molten Lava Cake", ingredients: [] }] }
                ]
            },
            {
                packageId: 3,
                name: "Chef's Signature",
                price: 3500,
                description: "The ultimate luxury experience featuring our chef's tasting menu.",
                menu: [
                    { category: "Starters", items: [{ name: "Foie Gras Terrine", ingredients: [] }, { name: "Lobster Bisque", ingredients: [] }] },
                    { category: "The Entrées", items: [{ name: "Wagyu A5 Striploin", ingredients: [] }] },
                    { category: "Finish", items: [{ name: "Gold Leaf Opera Cake", ingredients: [] }] }
                ]
            }
        ];

        fullPackages.forEach((menu) => {
            const docRef = db.collection("packages").doc();
            batch.set(docRef, menu);
        });

        await batch.commit();
        res.status(200).json({ message: "Menus Seeded Successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to seed" });
    }
};

module.exports = {
  getInventory,
  getAddOns,
  getMenus,
  getKitchenOrders,
  addIngredient,
  updateStock,
  updatePackage, // <--- MAKE SURE THIS IS HERE
  seedMenus
};