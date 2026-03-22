import User from "../models/user.js";
import Chat from "../models/chat.js";


export const getChatData = async (sender, receiverId) => {
  
  const chatKey =
    sender.userid < receiverId
      ? `${sender.userid}_${receiverId}`
      : `${receiverId}_${sender.userid}`;
  const chat = await Chat.findOne({ chatKey });

const receiverUser = await User.findById(receiverId);

  return {
    sender: {
      userid: sender.userid,
      name: sender.username
    },
    receiver: {
      receiverUser: receiverUser
    },
    messages: chat ? chat.messages : []
  };
};