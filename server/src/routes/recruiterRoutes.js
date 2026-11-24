import express from "express";
import {
  createRecruiterJob,
  deleteRecruiterJob,
  getRecruiterApplications,
  getRecruiterJobs,
  updateApplicationStatus,
  updateRecruiterJob,
} from "../controllers/recruiterController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, requireRole("recruiter"));
router.get("/jobs", getRecruiterJobs);
router.post("/jobs", createRecruiterJob);
router.put("/jobs/:jobId", updateRecruiterJob);
router.delete("/jobs/:jobId", deleteRecruiterJob);
router.get("/applications", getRecruiterApplications);
router.patch("/applications/:applicationId/status", updateApplicationStatus);

export default router;