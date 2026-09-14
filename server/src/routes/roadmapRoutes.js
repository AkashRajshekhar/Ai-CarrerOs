import express from "express";
import {
  generateRoadmap,
  getRoadmap,
  updateRoadmapItem,
} from "../controllers/roadmapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRoadmap);
router.post("/generate", protect, generateRoadmap);
router.put("/:itemId", protect, updateRoadmapItem);

export default router;
