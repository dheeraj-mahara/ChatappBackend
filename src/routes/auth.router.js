import express from "express"
const router = express.Router()
import { CheakLogin } from "../middlewares/auth.middleware.js";

import { SingupUser, LoginUser ,logout } from "../controllers/auth.controller.js"

router.post("/login", LoginUser)
router.post("/singup", SingupUser);
router.post("/logout", logout);
router.get("/me", CheakLogin, (req, res) => {
    res.json({ success: true, user: req.user });
});


export default router