import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    career: { type: String, required: true, trim: true },
    compatibility: { type: Number, min: 0, max: 100, required: true },
    summary: { type: String, required: true, trim: true },
    reasons: [{ type: String, trim: true }],
    strengths: [{ type: String, trim: true }],
    skillGaps: [{ type: String, trim: true }],
    roadmap: [{ type: String, trim: true }],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

recommendationSchema.index({ career: 1, compatibility: -1 });

const CareerRecommendation = mongoose.model(
  "CareerRecommendation",
  recommendationSchema,
);

export default CareerRecommendation;
