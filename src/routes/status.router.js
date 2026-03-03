import express from "express";
import { AddStatus, GetAllStatus } from "../controllers/status.controller.js";
import {upload} from "../middlewares/upload.middleware.js";
import { CheakLogin } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/add",CheakLogin,upload.single("image"),AddStatus);

router.get("/all", CheakLogin, GetAllStatus);


export default router
