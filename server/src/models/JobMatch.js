import mongoose from "mongoose";

const jobMatchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    matchingSkills: [{ type: String, trim: true }],
    missingSkills: [{ type: String, trim: true }],
    explanation: { type: String, trim: true },
  },
  { timestamps: true },
);

jobMatchSchema.index({ user: 1, job: 1 }, { unique: true });
jobMatchSchema.index({ user: 1, score: -1 });

const JobMatch = mongoose.model("JobMatch", jobMatchSchema);

export default JobMatch;
