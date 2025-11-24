const express = require("express");
const router = express.Router();

const { createInquiry, getInquiries } = require("../controllers/inquiryController");

// POST /api/inquiries
router.post("/", createInquiry);

// GET /api/inquiries
router.get("/", getInquiries);

module.exports = router;
