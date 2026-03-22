
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
import notificationRoutes from "./src/routes/notificationRoutes.js";
import ChatList from "./src/models/ChatList.js"
import user from "../models/user.js"
import axios from "axios";
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


const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.auth?.userId;  
  if (!userId) return socket.disconnect();

  onlineUsers.set(String(userId), socket.id);

 io.emit("onlineUsers", Array.from(onlineUsers.keys()));

 socket.join(String(userId));

 socket.on("sendMessage", async (data) => {
 const { senderId, receiverId, message, imageUrl } = data;
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

