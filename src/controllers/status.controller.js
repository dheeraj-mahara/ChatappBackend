
import Status from "../models/Status.js";
import { uploadeImage } from "../utils/uploadToCloudinary.js";
import { fetchAllStatuses } from "../services/status.service.js";



export const AddStatus = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { text } = req.body;

    let imageUrl = null;
   if (req.file) {
  const uploaded = await uploadeImage(req.file, "whatsnew/status");
  imageUrl = uploaded.imageUrl; 
}

    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const status = await Status.findOneAndUpdate(
      { userId },
      {
        $push: {
          statuses: {
            $each: [
              {
                text: text || null,
                image: imageUrl || null,
                expireAt,
                seenBy: []
              }
            ],
            $position: 0
          }
        }

      },
      {
        new: true,
        upsert: true  
      }
    );

    res.status(201).json({
      success: true,
      status
    });
    

  } catch (err) {
    console.error("❌ addStatus error:", err);
    res.status(500).json({ success: false });
  }
};


export const GetAllStatus = async (req, res) => {
  try {
    const statuses = await fetchAllStatuses();

    res.status(200).json({
      success: true,
      statuses
    });

  } catch (err) {
    console.error("❌ getAllStatus error:", err);
    res.status(500).json({ success: false });
  }
};
