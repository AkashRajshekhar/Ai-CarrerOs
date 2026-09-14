import express from "express";
import { getSkillGap } from "../controllers/skillGapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getSkillGap);

export default router;
