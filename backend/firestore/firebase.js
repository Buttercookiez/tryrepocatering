const admin = require("firebase-admin");

// Use "../" because the key is inside the 'backend' folder, just one level up.
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;