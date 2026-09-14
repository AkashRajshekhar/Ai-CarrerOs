import express from "express";
import {
  getAssistantReply,
  getChatHistory,
} from "../controllers/assistantController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, getAssistantReply);
router.get("/history", protect, getChatHistory);

export default router;
