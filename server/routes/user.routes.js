import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    logoutUser 
} from "../controllers/user.controller.js";
import { isUserLoggedOut,authenticateToken } from "../utils/middleware.js";

const router = new Router();

// Public routes (no authentication required)
router.post('/register', isUserLoggedOut, registerUser);
router.post('/login', isUserLoggedOut, loginUser);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getUserProfile);
router.post('/logout', authenticateToken, logoutUser);

export default router;