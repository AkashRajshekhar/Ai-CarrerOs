import express from "express";
import {
  getAssessment,
  saveAssessment,
} from "../controllers/assessmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAssessment);
router.get("/result", protect, getAssessment);
router.post("/", protect, saveAssessment);
router.post("/submit", protect, saveAssessment);

export default router;
