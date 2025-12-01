// backend/server.js
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const app = express();

// --- 1. CORS CONFIGURATION (The Fix) ---
// Add all the URLs that are allowed to talk to your backend here
const allowedOrigins = [
  "http://localhost:5173",                 // Vite Localhost
  "http://localhost:3000",                 // CRA Localhost
  "https://tryrepocatering-sfdi.vercel.app",     // YOUR VERCEL FRONTEND URL (Check your dashboard!)
  "https://mapos-web.vercel.app"           // Any other URL you deployed
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Electron, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      // If the URL isn't in the list, block it
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

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
const kitchenRoute = require("./routes/kitchenRoutes"); 
const inventoryRoute = require("./routes/inventoryRoutes"); 

// --- MOUNT ROUTES ---
app.use("/api/inquiries", inquiryRoute);
app.use("/api/paymongo", paymongoRoute);
app.use("/api/calendar", calendarRoute);
app.use("/api/kitchen", kitchenRoute);
app.use("/api/inventory", inventoryRoute);

// Test Route
app.get("/", (req, res) => {
  res.send("Server is Running! 🚀");
});

// --- 2. SERVER STARTUP (Fixed) ---
// Only listen on port if running locally (Development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

// REQUIRED FOR VERCEL DEPLOYMENT
module.exports = app;