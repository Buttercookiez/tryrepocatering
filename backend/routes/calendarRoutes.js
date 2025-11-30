const express = require("express");

// ✅ FIX: Added 'unblockDate' to the import list
const { getCalendarEvents, blockDate, unblockDate } = require("../controllers/calendarController");

const router = express.Router();

// Route: /api/calendar/events
router.get("/events", getCalendarEvents);

// Route: /api/calendar/block
router.post("/block", blockDate);

// Route: /api/calendar/unblock/:id
router.delete("/unblock/:id", unblockDate);

module.exports = router;