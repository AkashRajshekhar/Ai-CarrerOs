import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import jobsRoutes from "./routes/jobsRoutes.js";
import skillGapRoutes from "./routes/skillGapRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
];

const envPath = envCandidates.find((filePath) => fs.existsSync(filePath));

dotenv.config({ path: envPath });

const app = express();
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

app.get("/api/health", (_request, response) => {
  response.json({ success: true, message: "AI CareerOS API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/recruiter", recruiterRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
