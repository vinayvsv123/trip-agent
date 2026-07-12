import {register,login,profile,logout} from "../controllers/User.controller.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router=Router();

router.post("/register",register);
router.post("/login",login);
router.get("/profile",authMiddleware,profile);
router.post("/logout",authMiddleware,logout);

export default router;