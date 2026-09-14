import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    answers: {
      type: Object,
      default: {},
    },
    result: {
      type: Object,
      default: {},
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
