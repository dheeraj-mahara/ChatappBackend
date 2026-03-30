import express from "express";
import { updateProfile } from "../controllers/user.controller.js";
import { CheakLogin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();


router.put("/update-profile",CheakLogin,  upload.single("image"),updateProfile);


export default router
