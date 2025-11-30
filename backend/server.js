// backend/server.js
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));

// JSON Body Parsing (Skip for Webhooks if needed)
app.use((req, res, next) => {
  if (req.originalUrl.includes('/webhook')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// --- IMPORT ROUTES ---
const inquiryRoute = require("./routes/inquiryRoute");
const paymongoRoute = require("./routes/paymongoRoute");
const calendarRoute = require("./routes/calendarRoutes");
const kitchenRoute = require("./routes/kitchenRoutes"); // <--- ADD THIS
const inventoryRoute = require("./routes/inventoryRoutes"); // <--- ADD

// --- MOUNT ROUTES ---
app.use("/api/inquiries", inquiryRoute);
app.use("/api/paymongo", paymongoRoute);
app.use("/api/calendar", calendarRoute);
app.use("/api/kitchen", kitchenRoute); // <--- ADD THIS
app.use("/api/inventory", inventoryRoute); // <--- ADD

// Test Route
app.get("/", (req, res) => {
  res.send("Server is Running! 🚀");
});

// Only listen on port if running locally (Development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

// REQUIRED FOR VERCEL DEPLOYMENT
module.exports = app;

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   Kitchen API:     http://localhost:${PORT}/api/kitchen/inventory`);
});