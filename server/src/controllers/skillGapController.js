import Assessment from "../models/Assessment.js";
import Profile from "../models/Profile.js";
import SkillGap from "../models/SkillGap.js";

const careerSkills = {
  "Full Stack Developer": [
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "REST APIs",
    "Git",
    "TypeScript",
    "Testing",
    "Docker",
    "System Design",
  ],
  "Frontend Developer": [
    "JavaScript",
    "React",
    "HTML",
    "CSS",
    "Git",
    "TypeScript",
    "Accessibility",
    "Testing",
  ],
  "Backend Developer": [
    "JavaScript",
    "Node.js",
    "REST APIs",
    "Databases",
    "Git",
    "Testing",
    "Security",
    "System Design",
  ],
  "AI / ML Engineer": [
    "Python",
    "Mathematics",
    "Statistics",
    "Machine Learning",
    "SQL",
    "Git",
    "Model Evaluation",
  ],
  "Data Analyst": [
    "SQL",
    "Excel",
    "Python",
    "Statistics",
    "Data Visualization",
    "Power BI",
    "Communication",
  ],
  "Cloud / DevOps Engineer": [
    "Linux",
    "Networking",
    "Git",
    "Docker",
    "CI/CD",
    "AWS",
    "Monitoring",
    "Security",
  ],
};

const careerNames = Object.keys(careerSkills);

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[./_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getTargetCareer = (requestedCareer, assessmentCareer) => {
  const requested = requestedCareer?.trim();
  if (requested && careerNames.includes(requested)) return requested;
  if (assessmentCareer && careerNames.includes(assessmentCareer))
    return assessmentCareer;
  return "Full Stack Developer";
};

const calculateSkillGap = (targetCareer, profile, additionalSkills = []) => {
  const knownSkills = [
    ...(profile?.skills?.programmingLanguages || []),
    ...(profile?.skills?.frameworks || []),
    ...(profile?.skills?.databases || []),
    ...(profile?.skills?.tools || []),
    ...additionalSkills,
  ];
  const known = new Set(knownSkills.map(normalize));

  const skills = careerSkills[targetCareer].map((skill, index) => {
    const isKnown =
      known.has(normalize(skill)) ||
      [...known].some(
        (value) =>
          value.includes(normalize(skill)) || normalize(skill).includes(value),
      );
    const status = isKnown
      ? index < 4
        ? "Mastered"
        : "Intermediate"
      : index < 4
        ? "Beginner"
        : "Missing";
    const priority =
      status === "Missing" ? "High" : status === "Beginner" ? "Medium" : "Low";
    return { name: skill, status, priority };
  });

  const masteredWeight = {
    Mastered: 1,
    Intermediate: 0.75,
    Beginner: 0.35,
    Missing: 0,
  };
  const completion = Math.round(
    (skills.reduce((sum, skill) => sum + masteredWeight[skill.status], 0) /
      skills.length) *
      100,
  );
  const prioritySkills = skills
    .filter((skill) => skill.priority === "High")
    .map((skill) => skill.name);
  const learningOrder = skills
    .filter((skill) => skill.status !== "Mastered")
    .sort(
      (a, b) =>
        ({ High: 0, Medium: 1, Low: 2 })[a.priority] -
        { High: 0, Medium: 1, Low: 2 }[b.priority],
    )
    .map((skill) => skill.name);

  return { targetCareer, completion, skills, prioritySkills, learningOrder };
};

export const getSkillGap = async (request, response) => {
  try {
    const [saved, assessment, profile] = await Promise.all([
      SkillGap.findOne({ user: request.user._id }).lean(),
      Assessment.findOne({ user: request.user._id }).lean(),
      Profile.findOne({ user: request.user._id }).lean(),
    ]);

    if (saved && !request.query.career) {
      return response.status(200).json({ success: true, data: saved });
    }

    const targetCareer = getTargetCareer(
      request.query.career,
      assessment?.result?.topCareer,
    );
    const additionalSkills = (request.query.extraSkills || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    const data = calculateSkillGap(targetCareer, profile, additionalSkills);
    const savedAnalysis = await SkillGap.findOneAndUpdate(
      { user: request.user._id },
      { $set: { user: request.user._id, ...data } },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    return response.status(200).json({ success: true, data: savedAnalysis });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to generate skill gap analysis.",
    });
  }
};
