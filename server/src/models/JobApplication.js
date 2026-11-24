import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      validate: {
        validator: (value) => !value || /^https?:\/\/\S+$/i.test(value),
        message: "Please provide a valid resume URL.",
      },
    },
    coverLetter: { type: String, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["submitted", "reviewing", "interview", "rejected", "hired"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

jobApplicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
jobApplicationSchema.index({ job: 1, status: 1, createdAt: -1 });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;