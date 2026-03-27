
import { uploadeImage } from "../utils/uploadToCloudinary.js";
import { getChatData } from "../services/chat.service.js";
import { getAllUsers } from "./auth.controller.js";
import User from "../models/user.js";
import Chat from "../models/chat.js";
import ChatList from "../models/ChatList.js";
import cloudinary from "../config/cloudinary.js";
import { sendNotification } from "./notificationController.js";



export const OpenchatPage = async (req, res) => {
  try {
    const sender = req.user;

    const allUsers = await getAllUsers();

    const lastMessages = await getLastMessagesForUser(sender.userid);
    const currentUser = allUsers.find(
      user => String(user.id) === String(sender.userid)
    );

    const chatUsers = await ChatList.find({
      ownerId: String(sender.userid)
    }).sort({ updatedAt: -1 });

    const users = chatUsers.map(chat => {
      const user = allUsers.find(u => u.id === chat.contactId);
      if (!user) return null;

      const lastMessageData = lastMessages[user.id];
      let lastMessageText = '';
      if (lastMessageData) {
        if (lastMessageData.message && lastMessageData.message.trim() !== '') {
          lastMessageText = lastMessageData.message;
        } else if (lastMessageData.imageUrl) {
          lastMessageText = '📷 Image';

        }
      }
      const lastMessageStatus = lastMessageData?.status || "sent";
      const senderId = lastMessageData?.senderId || "";


      return {
        id: user.id,
        name: user.name,
        online: user.online,
        lastMessage: lastMessageText,
        updatedAt: chat.updatedAt,
        lastMessageStatus: lastMessageStatus,
        senderId: senderId
      };
    }).filter(Boolean);

    return res.json({
      success: true,
      currentUser,
      users,
      allUsers
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const GetChatMessages = async (req, res) => {
  try {
    const senderId = req.user.userid;
    const receiverId = req.params.receiverId;

    const chatData = await getChatData(
      { userid: senderId },
      receiverId
    );

    return res.json({
      success: true,
      chatData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to load messages"
    });
  }
};


export const getLastMessagesForUser = async (currentUserId) => {

  try {
    const chats = await Chat.find({
      chatKey: { $regex: currentUserId.toString() }
    }).lean();

    const lastMessages = {};

    chats.forEach(chat => {
      if (!chat.messages || chat.messages.length === 0) return;

      const lastMsg = chat.messages[chat.messages.length - 1];

      const [user1, user2] = chat.chatKey.split("_");
      const otherUserId = user1 === currentUserId.toString() ? user2 : user1;


      lastMessages[otherUserId] = {
        message: lastMsg.message,
        imageUrl: lastMsg.imageUrl,
        time: lastMsg.time,
        status: lastMsg.status,
        senderId: lastMsg.senderId.toString()

      };
    });

    return lastMessages;
  } catch (error) {
    console.error("❌ Error fetching last messages:", error);
    return {};
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userid;
    const receiverId = req.params.receiverId;
    const { text } = req.body;
    const isSelfMessage = senderId === receiverId;
    const sender = await User.findById(senderId).select("name")
    const sendername = sender.name



    if (!text && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Empty message"
      });
    }

    if (!isSelfMessage) {
      await sendNotification(receiverId, text, sendername);
    }

    let imageUrl = null;
    let public_id = null;

    if (req.file) {
      const uploadResult = await uploadeImage(req.file, "chat/images");
      imageUrl = uploadResult.imageUrl;
      public_id = uploadResult.public_id;
    }

    const time = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    const savedMessage = await saveMessageToDB({
      senderId,
      receiverId,
      message: text,     
      imageUrl,
      public_id,
      time
    });


    return res.json({
      success: true,
      savedMessage
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


export const saveMessageToDB = async ({ senderId, receiverId, message, imageUrl, public_id, time }) => {
  try {
    await ChatList.findOneAndUpdate(
      { ownerId: senderId, contactId: receiverId },
      {
        lastMessage: message || "📷 Image",
        updatedAt: new Date()
      },
      { upsert: true }
    );

    await ChatList.findOneAndUpdate(
      { ownerId: receiverId, contactId: senderId },
      {
        lastMessage: message || "📷 Image",
        updatedAt: new Date()
      },
      { upsert: true }
    );

    const chatKey =
      senderId < receiverId
        ? `${senderId}_${receiverId}`
        : `${receiverId}_${senderId}`;

    let chat = await Chat.findOne({ chatKey });

    if (!chat) {
      chat = new Chat({
        chatKey,
        messages: []
      });
    }

    chat.messages.push({
      senderId,
      receiverId,
      message,
      imageUrl,
      public_id,
      time
    });

    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    const updatedSenderList = await ChatList.find({
      ownerId: senderId
    }).sort({ updatedAt: -1 });


    const updatedReceiverList = await ChatList.find({
      ownerId: receiverId
    }).sort({ updatedAt: -1 });




    return {

      savedMessage,
      senderList: updatedSenderList,
      receiverList: updatedReceiverList
    };

  } catch (error) {
    console.error("Save message error:", error);
    return null;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      {
        online: status.online,
        lastSeen: status.lastSeen
      },
      { new: true }
    );

    return updatedUser ? true : false;

  } catch (error) {
    console.error("❌ Error updating user status:", error);
    return false;
  }
};

export const imagework = async (req, res) => {
  try {

    const { roomId, senderId } = req.body;
    let time = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    let imageUrl;
    let public_id


    if (req.file) {
      const uploadResult = await uploadeImage(req.file, "whatsnew/chat");

      imageUrl = uploadResult.imageUrl;
      public_id = uploadResult.public_id;

    }



    res.json({
      senderId,
      imageUrl,
      public_id,
      roomId,
      time: time,
    });


  } catch (err) {
    console.log(err,);
    res.status(500).json({ success: false })
  }

}




const getPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  const len = parts.length;
  // last 2 parts: folder/file.jpg
  const folderFile = parts[len - 2] + "/" + parts[len - 1];
  // remove extension
  return folderFile.split(".")[0];
};

export const DeleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const chat = await Chat.findOne({ "messages._id": messageId });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    const message = chat.messages.id(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }


    let publicId = message.public_id;

    if (!publicId && message.imageUrl) {
      publicId = getPublicIdFromUrl(message.imageUrl);
    }

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.log("Cloudinary delete failed:", cloudErr.message);
      }
    }

    chat.messages.pull({ _id: messageId });
    await chat.save();

    res.json({ success: true, messageId });

  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

