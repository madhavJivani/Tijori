import { Router } from "express";
import { registerUser, loginUser, getUserProfile, logoutUser } from "../controllers/user.controller.js";
import { isUserLoggedOut, authenticateToken } from "../utils/middleware.js";
import { upload } from "../utils/multer.js";

const router = new Router();

// Public routes (no authentication required)
router.post('/register', upload.none() , isUserLoggedOut, registerUser);
router.post('/login', upload.none() , isUserLoggedOut, loginUser);

// Protected routes (authentication required)
router.get('/profile', upload.none() , authenticateToken, getUserProfile);
router.post('/logout', upload.none() , authenticateToken, logoutUser);

export default router;