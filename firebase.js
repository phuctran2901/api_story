require("dotenv").config();

const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(
        "./audio-readingapp-firebase-adminsdk-4cpxo-a6642ab44b.json"
    ),
    storageBucket: process.env.STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

module.exports = {
    bucket,
};
