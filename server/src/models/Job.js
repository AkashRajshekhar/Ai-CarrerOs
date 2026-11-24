import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skills: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (skills) => skills.length > 0,
        message: "At least one required skill must be listed.",
      },
    },
    experience: { type: String, trim: true, default: "Entry level" },
    salary: { type: String, trim: true },
    employmentType: { type: String, trim: true, default: "Full-time" },
    remote: { type: Boolean, default: false },
    applicationUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => !value || /^https?:\/\/\S+$/i.test(value),
        message: "Please provide a valid application URL.",
      },
    },
    career: { type: String, trim: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

jobSchema.index({
  title: "text",
  company: "text",
  location: "text",
  skills: "text",
});
jobSchema.index({ career: 1, remote: 1, createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
