const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// 1. Check if we are in production (Vercel) or local
let serviceAccount;

if (process.env.FIREBASE_PRIVATE_KEY) {
  // --- PRODUCTION (VERCEL) ---
  // We construct the credentials from the Environment Variables
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // IMPORTANT: Vercel turns newlines (\n) into string literals, so we fix them:
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
} else {
  // --- LOCAL DEVELOPMENT ---
  // If no env vars, try to load the file (only works on your computer)
  try {
    serviceAccount = require("../serviceAccountKey.json");
  } catch (error) {
    console.error("Error: Could not load serviceAccountKey.json and no Env Vars found.");
  }
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "..." // If you use Realtime Database, add this back
  });
  console.log("🔥 Firebase Admin Initialized");
} catch (error) {
  console.error("Firebase Admin Init Error:", error);
}

const db = admin.firestore();
module.exports = db;