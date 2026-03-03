import mongoose from "mongoose";

const chatListSchema = new mongoose.Schema({
    ownerId: { type: String, required: true },   
    contactId: { type: String, required: true }, 
    lastMessage: String,
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChatList", chatListSchema);