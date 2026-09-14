import Profile from "../models/Profile.js";
import Job from "../models/Job.js";

const jobs = [
  {
    id: "frontend-001",
    title: "Frontend Developer",
    company: "Northstar Labs",
    location: "Remote",
    mode: "Remote",
    type: "Full-time",
    career: "Frontend Developer",
    skills: ["React", "JavaScript", "CSS"],
    description:
      "Build accessible product interfaces with a small, collaborative product team.",
  },
  {
    id: "fullstack-001",
    title: "Junior Full Stack Engineer",
    company: "Orbit Systems",
    location: "Bengaluru",
    mode: "Hybrid",
    type: "Full-time",
    career: "Full Stack Developer",
    skills: ["React", "Node.js", "MongoDB"],
    description:
      "Ship customer-facing features across the web application and API layers.",
  },
  {
    id: "backend-001",
    title: "Backend Engineer Intern",
    company: "DataDock",
    location: "Remote",
    mode: "Remote",
    type: "Internship",
    career: "Backend Developer",
    skills: ["Node.js", "REST APIs", "Databases"],
    description:
      "Learn production API development while improving reliability and observability.",
  },
  {
    id: "data-001",
    title: "Data Analyst",
    company: "Clearview Finance",
    location: "Mumbai",
    mode: "On-site",
    type: "Full-time",
    career: "Data Analyst",
    skills: ["SQL", "Excel", "Power BI"],
    description:
      "Turn operational data into dashboards and decisions for business teams.",
  },
  {
    id: "cloud-001",
    title: "Cloud Operations Associate",
    company: "Stackline Cloud",
    location: "Hyderabad",
    mode: "Hybrid",
    type: "Full-time",
    career: "Cloud / DevOps Engineer",
    skills: ["Linux", "AWS", "CI/CD"],
    description:
      "Support dependable deployments and automate recurring cloud operations.",
  },
];

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[./_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getProfileSkills = (profile) =>
  [
    ...(profile?.skills?.programmingLanguages || []),
    ...(profile?.skills?.frameworks || []),
    ...(profile?.skills?.databases || []),
    ...(profile?.skills?.tools || []),
  ].map(normalize);

const buildJobMatch = (job, profile) => {
  const studentSkills = getProfileSkills(profile);
  const matchingSkills = job.skills.filter((skill) => {
    const normalizedSkill = normalize(skill);
    return studentSkills.some(
      (studentSkill) =>
        studentSkill.includes(normalizedSkill) ||
        normalizedSkill.includes(studentSkill),
    );
  });
  const missingSkills = job.skills.filter(
    (skill) => !matchingSkills.includes(skill),
  );
  const score = Math.round((matchingSkills.length / job.skills.length) * 100);

  return {
    score,
    matchingSkills,
    missingSkills,
    explanation: matchingSkills.length
      ? `Strong ${matchingSkills.slice(0, 2).join(" and ")} experience gives you a useful starting point for this role.`
      : "Build the required skills through a focused project before applying.",
    recommendation: missingSkills.length
      ? `Prioritize ${missingSkills.slice(0, 2).join(" and ")} to improve your fit.`
      : "Your listed skills cover the core requirements for this sample role.",
  };
};

export const getJobs = (request, response) => {
  const search = request.query.search?.trim().toLowerCase() || "";
  const mode = request.query.mode?.trim().toLowerCase() || "all";

  const filteredJobs = jobs.filter((job) => {
    const matchesMode = mode === "all" || job.mode.toLowerCase() === mode;
    const searchableText = [
      job.title,
      job.company,
      job.location,
      job.career,
      ...job.skills,
    ]
      .join(" ")
      .toLowerCase();
    return matchesMode && searchableText.includes(search);
  });

  return response.status(200).json({
    success: true,
    data: {
      jobs: filteredJobs,
      total: filteredJobs.length,
      modes: ["All", "Remote", "Hybrid", "On-site"],
    },
  });
};

export const getJobMatch = async (request, response) => {
  try {
    const job = jobs.find((item) => item.id === request.params.id);
    if (!job) {
      return response.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    const profile = await Profile.findOne({ user: request.user._id }).lean();
    return response.status(200).json({
      success: true,
      data: {
        job,
        match: buildJobMatch(job, profile),
      },
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to calculate job match.",
    });
  }
};

export const getJobById = async (request, response) => {
  try {
    const sampleJob = jobs.find((item) => item.id === request.params.id);
    if (sampleJob)
      return response.status(200).json({ success: true, data: sampleJob });

    const job = await Job.findOne({
      _id: request.params.id,
      isPublished: true,
    }).lean();
    if (!job)
      return response
        .status(404)
        .json({ success: false, message: "Job not found." });
    return response.status(200).json({ success: true, data: job });
  } catch (error) {
    return response
      .status(404)
      .json({ success: false, message: "Job not found." });
  }
};
