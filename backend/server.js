// Load environment variables
const dotenv = require("dotenv");
dotenv.config();

// Core modules
const express = require("express");
const cors = require("cors");
const app = express();

// 1. MIDDLEWARE: CORS
// We enable CORS for everything to ensure Ngrok and Localhost:3000 both work.
app.use(cors({
  origin: true, // Allows any origin (Good for development/Ngrok)
  credentials: true
}));

// 2. MIDDLEWARE: BODY PARSING (The Critical Fix)
// PayMongo Webhooks NEED the "raw" body to verify the signature.
// Standard API routes (like Inquiries) NEED "JSON" parsing.
// We conditionally apply JSON parsing only if the URL is NOT the webhook.
app.use((req, res, next) => {
  if (req.originalUrl.includes('/webhook')) {
    // Skip express.json() for webhooks. 
    // The route file (paymongoRoute.js) handles the raw body parsing.
    next();
  } else {
    // Use JSON parsing for everything else (Inquiries, Create Checkout, etc.)
    express.json()(req, res, next);
  }
});

// 3. ROUTES
const inquiryRoute = require("./routes/inquiryRoute");
const paymongoRoute = require("./routes/paymongoRoute");

// Mount Routes
app.use("/api/inquiries", inquiryRoute);
app.use("/api/paymongo", paymongoRoute);

// 4. TEST ROUTE (Optional)
// Add this so you don't see "Cannot GET" if you visit the root
app.get("/", (req, res) => {
  res.send("Server is Running! 🚀");
});

// 5. START SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`--------------------------------------------------`);
  console.log(`   API Endpoint:    http://localhost:${PORT}/api/inquiries`);
  console.log(`   PayMongo Init:   http://localhost:${PORT}/api/paymongo/create-checkout-session`);
  console.log(`   Webhook URL:     http://localhost:${PORT}/api/paymongo/webhook (POST only)`);
  console.log(`--------------------------------------------------\n`);
});