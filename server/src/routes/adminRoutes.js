import express from "express";
import {
  deleteUser,
  getAdminOverview,
  updateUserRole,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  createJob,
  deleteJob,
  updateJob,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, requireAdmin);
router.get("/overview", getAdminOverview);
router.patch("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);
router.post("/jobs", createJob);
router.put("/jobs/:jobId", updateJob);
router.delete("/jobs/:jobId", deleteJob);

export default router;
