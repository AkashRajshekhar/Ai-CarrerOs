import express from "express";
import fs from "node:fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "node:url";
import {
  getResumeAnalysis,
  uploadResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const uploadDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../uploads",
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_request, file, callback) => {
    callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_request, file, callback) => {
    if (file.mimetype === "application/pdf") {
      callback(null, true);
      return;
    }
    callback(new Error("Only PDF files are allowed."));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", protect, getResumeAnalysis);
router.post(
  "/upload",
  protect,
  (request, response, next) =>
    upload.single("resume")(request, response, (error) => {
      if (error) {
        return response.status(400).json({
          success: false,
          message: error.message || "Invalid resume upload.",
        });
      }
      return next();
    }),
  uploadResume,
);

export default router;
