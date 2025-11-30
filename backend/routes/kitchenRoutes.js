const express = require("express");
const { 
  getInventory, 
  getAddOns, 
  addIngredient, 
  updateStock, 
  getKitchenOrders,
  getMenus,
  seedMenus,
  updatePackage // <--- IMPORT THIS
} = require("../controllers/kitchenController");

const router = express.Router();

router.get("/inventory", getInventory);
router.post("/inventory", addIngredient);
router.put("/inventory/:id", updateStock);
router.get("/orders", getKitchenOrders);
router.get("/menus", getMenus);

// --- THIS IS THE ROUTE YOU WERE MISSING ---
router.put("/menus/:id", updatePackage); 
// -----------------------------------------

router.post("/seed-menus", seedMenus);
router.get("/addons", getAddOns);

module.exports = router;