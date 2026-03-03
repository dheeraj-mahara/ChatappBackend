import express from "express";
import { CheakLogin } from "../middlewares/auth.middleware.js";
import {
  OpenchatPage,
  sendMessage,
  DeleteMessage,
  GetChatMessages
} from "../controllers/chat.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { getChatData } from "../services/chat.service.js";

const router = express.Router();

router.get("/", CheakLogin, OpenchatPage);

router.get("/:receiverId", CheakLogin, GetChatMessages);

router.post(
  "/:receiverId",
  CheakLogin,
  upload.single("image"),
  sendMessage
);

router.get(
  "/:receiverId/data",
  CheakLogin,
  async (req, res) => {
    const sender = req.user;
    const receiverId = req.params.receiverId;

    const chatData = await getChatData(sender, receiverId);
    res.json(chatData);
  }
);

// delete message
router.delete("/message/:messageId", CheakLogin, DeleteMessage);

export default router;