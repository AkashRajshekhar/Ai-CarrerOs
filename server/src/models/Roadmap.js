import mongoose from "mongoose";

const roadmapItemSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    priority: { type: String, enum: ["High", "Medium", "Low"], required: true },
    estimatedHours: { type: Number, required: true, min: 1 },
    description: { type: String, required: true },
    prerequisites: [{ type: String }],
    project: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true },
);

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    targetCareer: { type: String, required: true },
    availableHoursPerWeek: { type: Number, min: 1, max: 80, default: 8 },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    items: [roadmapItemSchema],
  },
  { timestamps: true },
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
