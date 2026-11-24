import Assessment from "../models/Assessment.js";

const scoringMap = {
  problemSolving: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  programmingInterest: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  mathComfort: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  creativity: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  communication: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  techInterest: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  workStyle: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  careerPreference: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
};

const careerProfiles = [
  {
    name: "Full Stack Developer",
    fields: [
      "programmingInterest",
      "problemSolving",
      "communication",
      "techInterest",
      "workStyle",
    ],
  },
  {
    name: "Frontend Developer",
    fields: [
      "creativity",
      "communication",
      "programmingInterest",
      "techInterest",
    ],
  },
  {
    name: "Backend Developer",
    fields: [
      "problemSolving",
      "mathComfort",
      "programmingInterest",
      "workStyle",
    ],
  },
  {
    name: "AI / ML Engineer",
    fields: ["mathComfort", "problemSolving", "techInterest", "creativity"],
  },
  {
    name: "Data Analyst",
    fields: [
      "communication",
      "mathComfort",
      "problemSolving",
      "careerPreference",
    ],
  },
  {
    name: "Cloud / DevOps Engineer",
    fields: ["techInterest", "workStyle", "problemSolving", "communication"],
  },
  {
    name: "UX Designer",
    fields: ["creativity", "communication", "careerPreference", "techInterest"],
  },
  {
    name: "Cybersecurity Analyst",
    fields: ["problemSolving", "techInterest", "mathComfort", "workStyle"],
  },
  {
    name: "Product Manager",
    fields: [
      "communication",
      "creativity",
      "problemSolving",
      "careerPreference",
    ],
  },
  {
    name: "QA Automation Engineer",
    fields: [
      "problemSolving",
      "programmingInterest",
      "techInterest",
      "workStyle",
    ],
  },
];

const calculateAssessmentResult = (answers) => {
  const normalized = {};
  for (const key of Object.keys(scoringMap)) {
    normalized[key] = scoringMap[key][answers[key]] ?? 0;
  }

  const scores = careerProfiles.map((career) => {
    const total = career.fields.reduce(
      (total, field) => total + (normalized[field] || 0),
      0,
    );
    return { name: career.name, score: total / career.fields.length };
  });

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const topCareer = sorted[0];

  const average =
    Object.values(normalized).reduce((sum, value) => sum + value, 0) /
    Math.max(Object.values(normalized).length, 1);

  const strengths = [];
  if (normalized.programmingInterest >= 4)
    strengths.push("Programming curiosity and problem-solving mindset");
  if (normalized.mathComfort >= 4)
    strengths.push("Comfort with structured and analytical thinking");
  if (normalized.creativity >= 4)
    strengths.push("Strong creative and design orientation");
  if (normalized.communication >= 4)
    strengths.push("Communication and collaboration strengths");

  if (strengths.length === 0)
    strengths.push("Growth potential across multiple career paths");

  const gaps = [];
  if (normalized.techInterest < 4)
    gaps.push(
      "Increase your exposure to modern tools and emerging technologies",
    );
  if (normalized.problemSolving < 4)
    gaps.push("Practice structured problem solving with coding exercises");
  if (normalized.communication < 4)
    gaps.push("Strengthen communication and presentation skills");

  if (gaps.length === 0)
    gaps.push(
      "Keep refining your strengths with practical projects and portfolio work",
    );

  return {
    topCareer: topCareer.name,
    topCareerScore: Math.round(topCareer.score * 20),
    averageScore: Math.round(average * 20),
    strengths,
    gaps,
    recommendations: [
      `Focus on ${topCareer.name.toLowerCase()} opportunities and adjacent skills`,
      "Build 1–2 project-based proof points to strengthen your profile",
      "Keep practicing communication and technical depth to improve confidence",
    ],
  };
};

export const getAssessment = async (request, response) => {
  try {
    const assessment = await Assessment.findOne({
      user: request.user._id,
    }).lean();

    response.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: "Unable to fetch assessment.",
    });
  }
};

export const saveAssessment = async (request, response) => {
  try {
    const { answers } = request.body;

    if (!answers || typeof answers !== "object") {
      return response.status(400).json({
        success: false,
        message: "Assessment answers are required.",
      });
    }

    const result = calculateAssessmentResult(answers);

    const assessment = await Assessment.findOneAndUpdate(
      { user: request.user._id },
      {
        $set: {
          user: request.user._id,
          answers,
          result,
          completedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return response.status(200).json({
      success: true,
      message: "Assessment saved successfully.",
      data: assessment,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to save assessment.",
    });
  }
};
