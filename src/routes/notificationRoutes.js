import express from "express";
import User from "../models/user.js";
import admin from "../firebaseAdmin.js";
const router = express.Router();

router.post("/save-token", async (req, res) => {

  const { userId, token } = req.body;
  try {

    await User.findByIdAndUpdate(userId, {
      fcm_token: token
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }

});


router.get("/test", async (req, res) => {

 await admin.messaging().send({
  token: process.env.FIREBASE_PRIVATE_KEY,
  notification: {
    title: "Test",
    body: "Working 🔥"
  }
});

  res.send("sent");

});


export default router;