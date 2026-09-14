import express from "express";
import {
  createOrUpdateProfile,
  getProfile,
} from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.post("/", protect, createOrUpdateProfile);
router.put("/", protect, createOrUpdateProfile);

export default router;
