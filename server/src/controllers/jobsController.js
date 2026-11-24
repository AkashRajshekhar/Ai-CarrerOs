import Profile from "../models/Profile.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import JobApplication from "../models/JobApplication.js";

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
  const requiredSkills = (job.skills || []).filter(Boolean);
  const studentSkills = getProfileSkills(profile);
  const matchingSkills = requiredSkills.filter((skill) => {
    const normalizedSkill = normalize(skill);
    return studentSkills.some(
      (studentSkill) =>
        studentSkill.includes(normalizedSkill) ||
        normalizedSkill.includes(studentSkill),
    );
  });
  const missingSkills = requiredSkills.filter(
    (skill) => !matchingSkills.includes(skill),
  );
  const score = requiredSkills.length
    ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
    : 0;

  return {
    score,
    matchingSkills,
    missingSkills,
    explanation: matchingSkills.length
      ? `Strong ${matchingSkills.slice(0, 2).join(" and ")} experience gives you a useful starting point for this role.`
      : "Build the required skills through a focused project before applying.",
    recommendation: missingSkills.length
      ? `Prioritize ${missingSkills.slice(0, 2).join(" and ")} to improve your fit.`
      : "Your listed skills cover the core requirements for this role.",
  };
};

const toJobResponse = (job) => {
  const isSample = job.description?.startsWith("SAMPLE LISTING:") || false;
  const description = isSample
    ? job.description.replace(/^SAMPLE LISTING:\s*/, "")
    : job.description;
  const mode = /\bhybrid\b/i.test(job.location)
    ? "Hybrid"
    : job.remote
      ? "Remote"
      : "On-site";

  return {
    ...job,
    id: String(job._id),
    mode,
    type: job.employmentType,
    description,
    isSample,
  };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getJobs = async (request, response) => {
  try {
    const search = request.query.search?.trim();
    const mode = request.query.mode?.trim().toLowerCase() || "all";
    const query = { isPublished: true };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { career: searchRegex },
        { skills: searchRegex },
      ];
    }

    if (mode === "remote") query.remote = true;
    if (mode === "hybrid") query.location = { $regex: "\\bhybrid\\b", $options: "i" };
    if (mode === "on-site") {
      query.remote = false;
      query.location = { $not: /\bhybrid\b/i };
    }

    const documents = await Job.find(query).sort({ createdAt: -1 }).lean();
    const jobs = documents.map(toJobResponse);

    return response.status(200).json({
      success: true,
      data: { jobs, total: jobs.length, modes: ["All", "Remote", "Hybrid", "On-site"] },
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to load job listings.",
    });
  }
};

export const getJobMatch = async (request, response) => {
  try {
    const job = await Job.findOne({
      _id: request.params.id,
      isPublished: true,
    }).lean();
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
        job: toJobResponse(job),
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
    const job = await Job.findOne({
      _id: request.params.id,
      isPublished: true,
    }).lean();
    if (!job)
      return response
        .status(404)
        .json({ success: false, message: "Job not found." });
    return response.status(200).json({
      success: true,
      data: toJobResponse(job),
    });
  } catch (error) {
    return response
      .status(404)
      .json({ success: false, message: "Job not found." });
  }
};

export const getSavedJobs = async (request, response) => {
  try {
    const user = await User.findById(request.user._id)
      .select("savedJobs")
      .populate({ path: "savedJobs", match: { isPublished: true } })
      .lean();
    const jobs = (user?.savedJobs || []).map(toJobResponse);
    return response.status(200).json({ success: true, data: { jobs } });
  } catch (error) {
    return response.status(500).json({ success: false, message: "Unable to load saved jobs." });
  }
};

export const saveJob = async (request, response) => {
  try {
    const job = await Job.findOne({ _id: request.params.id, isPublished: true });
    if (!job) return response.status(404).json({ success: false, message: "Job not found." });
    await User.updateOne({ _id: request.user._id }, { $addToSet: { savedJobs: job._id } });
    return response.status(200).json({ success: true, data: { saved: true } });
  } catch (error) {
    return response.status(500).json({ success: false, message: "Unable to save this job." });
  }
};

export const unsaveJob = async (request, response) => {
  try {
    await User.updateOne({ _id: request.user._id }, { $pull: { savedJobs: request.params.id } });
    return response.status(200).json({ success: true, data: { saved: false } });
  } catch (error) {
    return response.status(500).json({ success: false, message: "Unable to remove this saved job." });
  }
};

export const applyForJob = async (request, response) => {
  try {
    const job = await Job.findOne({ _id: request.params.id, isPublished: true }).lean();
    if (!job) return response.status(404).json({ success: false, message: "Job not found." });

    const application = await JobApplication.create({
      candidate: request.user._id,
      job: job._id,
      resumeUrl: request.body.resumeUrl?.trim(),
      coverLetter: request.body.coverLetter?.trim(),
    });
    return response.status(201).json({
      success: true,
      message: "Application submitted.",
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ success: false, message: "You have already applied for this job." });
    }
    if (error.name === "ValidationError") {
      return response.status(400).json({ success: false, message: "Please provide valid application details." });
    }
    return response.status(500).json({ success: false, message: "Unable to submit your application." });
  }
};

export const getMyApplications = async (request, response) => {
  try {
    const applications = await JobApplication.find({ candidate: request.user._id })
      .populate("job", "title company location salary employmentType")
      .sort({ createdAt: -1 })
      .lean();
    return response.status(200).json({ success: true, data: { applications } });
  } catch (error) {
    return response.status(500).json({ success: false, message: "Unable to load your applications." });
  }
};
