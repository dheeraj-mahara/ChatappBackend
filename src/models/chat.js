import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: String,
  imageUrl: String,
  time: String,
  public_id: String,
    status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent"
  }
}
,{ timestamps: true });


const chatSchema = new mongoose.Schema(
  {
    chatKey: {
      type: String,
      unique: true
    },
    messages: [messageSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
