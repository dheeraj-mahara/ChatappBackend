import User from "../models/user.js";
import { uploadeImage } from "../utils/uploadToCloudinary.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { name, about } = req.body;

    let imageUrl = null;

    if (req.file) {
      const uploaded = await uploadeImage(req.file, "chat/profile");
      imageUrl = uploaded.imageUrl;
    }
    const exists = await User.findOne({
      name,
      _id: { $ne: userId }
    });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Username already taken"
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (about) updateData.about = about;
    if (imageUrl) updateData.image = imageUrl;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    res.json({ success: true, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};