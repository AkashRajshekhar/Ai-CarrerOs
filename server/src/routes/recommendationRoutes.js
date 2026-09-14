import express from "express";
import { getRecommendation } from "../controllers/recommendationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRecommendation);

export default router;
