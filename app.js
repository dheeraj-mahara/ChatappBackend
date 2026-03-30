
import express from "express"
import { config } from "dotenv"
import http from "http"
import { Server } from "socket.io"
import connectDB from "./src/config/db.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import ChatRoutes from "./src/routes/chat.router.js";
import AuthRoutes from "./src/routes/auth.router.js";
import StatusRoutes from "./src/routes/status.router.js"
import userRoutes from "./src/routes/user.router.js"
import notificationRoutes from "./src/routes/notificationRoutes.js";
import ChatList from "./src/models/ChatList.js"
import user from "./src/models/user.js"
import axios from "axios";
import { log } from "console"
import chat from "./src/models/chat.js"
import mongoose from "mongoose"
axios.defaults.withCredentials = true;

config()
const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 5000

// const allowedOrigin = "https://chat-vibe-theta.vercel.app";
const allowedOrigin = [
  "http://localhost:5173",
  "https://chat-vibe-theta.vercel.app"
]

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});

app.set("socketio", io);

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));


app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get("/ping", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// routes 
app.use("/api/auth", AuthRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/status", StatusRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/user", userRoutes);


const onlineUsers = new Map();

io.on("connection", async (socket) => {
  const userId = socket.handshake.auth?.userId;
  if (!userId) return socket.disconnect();

  onlineUsers.set(String(userId), socket.id);
  socket.join(String(userId));

  io.emit("onlineUsers", Array.from(onlineUsers.keys()));


  const conversations = await chat.find({
    "messages.receiverId": userId,
    "messages.status": "sent"
  });

  for (const convo of conversations) {
    let updated = false;

    for (const msg of convo.messages) {
      if (msg.receiverId == userId && msg.status === "sent") {
        msg.status = "delivered";
        updated = true;

        io.to(String(msg.senderId)).emit("messageDelivered", {
          messageId: msg._id
        });
      }
    }

    if (updated) {
      await convo.save();
    }
  }


  socket.on("sendMessage", async (data) => {

    const { senderId, receiverId, message, imageUrl, _id } = data;
    let lastMsg = "";
    if (message && message.trim() !== "") {
      lastMsg = message;
    } else if (imageUrl) {
      lastMsg = "📷 Image";
    }

    const senderChat = await ChatList.findOneAndUpdate(
      { ownerId: senderId, contactId: receiverId },
      {
        lastMessage: lastMsg,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const receiverChat = await ChatList.findOneAndUpdate(
      { ownerId: receiverId, contactId: senderId },
      {
        lastMessage: lastMsg,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const sender = await user.findById(senderId).select("name");
    const receiver = await user.findById(receiverId).select("name");

    io.to(String(receiverId)).emit("newMessage", data);
    io.to(String(senderId)).emit("newMessage", data);


    const isReceiverOnline = onlineUsers.has(String(receiverId));

    if (
      isReceiverOnline &&
      mongoose.Types.ObjectId.isValid(_id) // 👈 ADD THIS
    ) {
      await chat.updateOne(
        { "messages._id": _id },
        { $set: { "messages.$.status": "delivered" } }
      );

      io.to(String(senderId)).emit("messageDelivered", {
        messageId: _id
      });
    }

    io.to(String(senderId)).emit("chatUserUpdate", {
      contactId: receiverId,
      user: receiver.name,
      lastMessage: lastMsg,
      updatedAt: senderChat.updatedAt,
    });

    io.to(String(receiverId)).emit("chatUserUpdate", {
      contactId: senderId,
      user: sender.name,
      lastMessage: lastMsg,
      updatedAt: receiverChat.updatedAt,
    });
  });


  socket.on("markAsRead", async ({ senderId, messageIds }) => {
    if (!senderId || !messageIds?.length) return;

    const validIds = messageIds.filter(id =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (!validIds.length) return;

    await chat.updateMany(
      { "messages._id": { $in: validIds } },
      {
        $set: { "messages.$[elem].status": "read" }
      },
      {
        arrayFilters: [{ "elem._id": { $in: validIds } }]
      }
    );

    io.to(String(senderId)).emit("messageRead", {
      messageIds: validIds
    });
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    if (senderId === receiverId) return;

    io.to(String(receiverId)).emit("typing", { senderId });
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    io.to(String(receiverId)).emit("stopTyping", { senderId });
  });


  socket.on("disconnect", () => {
    onlineUsers.delete(String(userId));
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

});

const startServer = async () => {
  await connectDB();

  server.listen(port, () => {
    console.log("port start at ", port);

  })
};
startServer()

