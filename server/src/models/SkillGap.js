import mongoose from "mongoose";

const skillGapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    targetCareer: { type: String, required: true, trim: true },
    completion: { type: Number, min: 0, max: 100, required: true },
    skills: [
      {
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ["Mastered", "Intermediate", "Beginner", "Missing"],
          required: true,
        },
        priority: {
          type: String,
          enum: ["High", "Medium", "Low"],
          required: true,
        },
      },
    ],
    prioritySkills: [{ type: String }],
    learningOrder: [{ type: String }],
  },
  { timestamps: true },
);

const SkillGap = mongoose.model("SkillGap", skillGapSchema);

export default SkillGap;
