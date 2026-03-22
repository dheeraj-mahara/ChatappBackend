import admin from "../firebaseAdmin.js";
import User from "../models/User.js";

export const sendNotification = async (receiverId, message, sendername) => {
  try {
    const user = await User.findById(receiverId);

    if (!user || !user.fcm_token) {
      console.log("No token found");
      return;
    }

    await admin.messaging().send({
      token: user.fcm_token,
      notification: {
        title: sendername,
        body: message || "📷 image",
      },
    });

    // console.log("Notification sent");

  } catch (err) {
    console.log("Notification error:", err);
  }
};