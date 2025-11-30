// backend/routes/inventoryRoutes.js
const express = require("express");
const { 
  getInventory, 
  addAsset, 
  updateAsset, // Renamed from updateStock
  deleteAsset, // New
  getAllocationEvents, 
  allocateAssetsForEvent,
  seedAssets 
} = require("../controllers/inventoryController");

const router = express.Router();

router.get("/", getInventory); 
router.post("/", addAsset); 
router.put("/:id", updateAsset); // Handles both Stock updates and Edit Details
router.delete("/:id", deleteAsset); // New Route
router.get("/allocations", getAllocationEvents);
router.post("/allocate", allocateAssetsForEvent);
router.post("/seed", seedAssets);

module.exports = router;