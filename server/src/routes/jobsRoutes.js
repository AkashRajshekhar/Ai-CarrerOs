import express from "express";
import {
  applyForJob,
  getMyApplications,
  getSavedJobs,
  getJobById,
  getJobMatch,
  getJobs,
  saveJob,
  unsaveJob,
} from "../controllers/jobsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/saved", protect, requireRole("student"), getSavedJobs);
router.get("/applications", protect, requireRole("student"), getMyApplications);
router.put("/:id/save", protect, requireRole("student"), saveJob);
router.delete("/:id/save", protect, requireRole("student"), unsaveJob);
router.post("/:id/apply", protect, requireRole("student"), applyForJob);
router.get("/:id/match", protect, getJobMatch);
router.get("/:id", protect, getJobById);

export default router;
