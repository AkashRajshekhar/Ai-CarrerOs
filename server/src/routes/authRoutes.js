import express from "express";
import {
  getCurrentUser,
  changePassword,
  deleteAccount,
  login,
  logout,
  signup,
  updateAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);
router.put("/account", protect, updateAccount);
router.put("/password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

export default router;
