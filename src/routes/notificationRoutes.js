import express from "express";
import User from "../models/User.js";
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
  token: "fMMbRG8nx-vHP8DBcwHHlL:APA91bHekebdKUutD0Ja_xoJWnEsYnUJGpd6hIGeD8rEYEFvUJDzspkkXB1DJFIovFoUv6nBwgx6wUyZEO6SDgUe2p2ryG7E5Czic2F0Tm_W94PnT_k3oZ4",
  notification: {
    title: "Test",
    body: "Working 🔥"
  }
});

  res.send("sent");

});


export default router;