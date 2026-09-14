import express from "express";
import {
  getInterviewQuestions,
  submitInterview,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getInterviewQuestions);
router.post("/submit", protect, submitInterview);

export default router;
