import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    interviewType: {
      type: String,
      enum: ["Technical", "HR", "Behavioral", "Coding"],
      required: true,
    },
    answers: [{ questionId: String, text: String, rating: Number }],
    score: { type: Number, min: 0, max: 100, required: true },
    evaluation: {
      technicalAccuracy: { type: Number, min: 0, max: 10 },
      clarity: { type: Number, min: 0, max: 10 },
      completeness: { type: Number, min: 0, max: 10 },
    },
    feedback: [String],
  },
  { timestamps: true },
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
