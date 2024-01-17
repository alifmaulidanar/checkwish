const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Jalankan server
require("./server/server");
