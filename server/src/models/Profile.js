import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    college: { type: String, trim: true },
    degree: { type: String, trim: true },
    branch: { type: String, trim: true },
    graduationYear: { type: Number },
    cgpa: { type: Number },
    skills: {
      programmingLanguages: [{ type: String, trim: true }],
      frameworks: [{ type: String, trim: true }],
      databases: [{ type: String, trim: true }],
      tools: [{ type: String, trim: true }],
    },
    experience: {
      projects: [{ type: String, trim: true }],
      internships: [{ type: String, trim: true }],
      certifications: [{ type: String, trim: true }],
      achievements: [{ type: String, trim: true }],
    },
    careerInterests: [{ type: String, trim: true }],
    links: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      portfolio: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  },
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
