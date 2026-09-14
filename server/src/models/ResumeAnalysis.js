import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    strengths: [{ type: String, trim: true }],
    gaps: [{ type: String, trim: true }],
    suggestions: [{ type: String, trim: true }],
    rawText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

export default ResumeAnalysis;
