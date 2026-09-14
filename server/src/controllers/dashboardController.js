import Assessment from "../models/Assessment.js";
import Profile from "../models/Profile.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import Roadmap from "../models/Roadmap.js";
import SkillGap from "../models/SkillGap.js";

const roleSuggestions = {
  "Full Stack Developer": [
    "Frontend Developer",
    "Backend Developer",
    "Product Engineer",
  ],
  "Frontend Developer": [
    "Frontend Developer",
    "React Developer",
    "UI Engineer",
  ],
  "Backend Developer": [
    "Backend Developer",
    "API Engineer",
    "Platform Engineer",
  ],
  "AI / ML Engineer": ["ML Engineer", "Data Scientist", "Applied AI Engineer"],
  "Data Analyst": ["Data Analyst", "BI Analyst", "Product Analyst"],
  "Cloud / DevOps Engineer": ["Cloud Engineer", "DevOps Engineer", "SRE"],
};

const normalizeCareer = (interest = "") => {
  const normalized = interest.toLowerCase();
  if (normalized.includes("ai") || normalized.includes("machine"))
    return "AI / ML Engineer";
  if (normalized.includes("full stack")) return "Full Stack Developer";
  if (normalized.includes("frontend")) return "Frontend Developer";
  if (normalized.includes("backend")) return "Backend Developer";
  if (
    normalized.includes("data analytics") ||
    normalized.includes("data analyst")
  )
    return "Data Analyst";
  if (normalized.includes("cloud") || normalized.includes("devops"))
    return "Cloud / DevOps Engineer";
  return interest;
};

export const getDashboardSummary = async (request, response) => {
  try {
    const [assessment, profile, resume, roadmap, skillGap] = await Promise.all([
      Assessment.findOne({ user: request.user._id }).lean(),
      Profile.findOne({ user: request.user._id }).lean(),
      ResumeAnalysis.findOne({ user: request.user._id })
        .sort({ createdAt: -1 })
        .lean(),
      Roadmap.findOne({ user: request.user._id }).lean(),
      SkillGap.findOne({ user: request.user._id }).lean(),
    ]);

    const career =
      normalizeCareer(profile?.careerInterests?.[0]) ||
      assessment?.result?.topCareer ||
      skillGap?.targetCareer ||
      "Career exploration";
    const resumeScore = resume?.score || 0;
    const careerMatch = assessment?.result?.averageScore || 0;
    const skillCompletion = skillGap?.completion || 0;
    const roadmapProgress = roadmap?.progress || 0;
    const readiness = Math.round(
      (resumeScore + careerMatch + skillCompletion + roadmapProgress) / 4,
    );

    return response.status(200).json({
      success: true,
      data: {
        readiness,
        cards: {
          resumeScore,
          careerMatch: career,
          careerMatchScore: careerMatch,
          skillGap: skillGap?.prioritySkills?.length || 0,
          roadmapProgress,
        },
        chart: [
          { label: "Resume", value: resumeScore },
          { label: "Career", value: careerMatch },
          { label: "Skills", value: skillCompletion },
          { label: "Roadmap", value: roadmapProgress },
        ],
        recommendedJobs: roleSuggestions[career] || [career],
        profileComplete: Boolean(profile),
        hasAssessment: Boolean(assessment?.result),
        hasResume: Boolean(resume),
        hasRoadmap: Boolean(roadmap),
      },
    });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to load dashboard summary." });
  }
};
