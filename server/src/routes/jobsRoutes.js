import express from "express";
import {
  getJobById,
  getJobMatch,
  getJobs,
} from "../controllers/jobsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getJobs);
router.get("/:id/match", protect, getJobMatch);
router.get("/:id", protect, getJobById);

export default router;
