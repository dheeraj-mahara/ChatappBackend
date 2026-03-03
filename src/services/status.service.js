import Status from "../models/Status.js";

export const fetchAllStatuses = async () => {
  try {
    const now = new Date();

    const data = await Status.find({
      "statuses.expireAt": { $gt: now }
    })
      .populate("userId", "name")
      .sort({ updatedAt: -1 })
      .lean();

    return data.map(item => ({
      userId: item.userId._id,
      userName: item.userId.name,
      statuses: item.statuses.filter(
        s => new Date(s.expireAt) > now
      )
    }));

  } catch (err) {
    console.error("❌ fetchAllStatuses error:", err);
    return [];
  }
};
