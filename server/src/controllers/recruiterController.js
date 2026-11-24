import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

const jobFields = [
  "title",
  "location",
  "description",
  "skills",
  "experience",
  "salary",
  "employmentType",
  "remote",
  "applicationUrl",
  "career",
  "isPublished",
];

const pickJobFields = (body) =>
  Object.fromEntries(
    jobFields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]]),
  );

export const getRecruiterJobs = async (request, response) => {
  try {
    const jobs = await Job.find({ postedBy: request.user._id }).sort({ createdAt: -1 }).lean();
    return response.status(200).json({ success: true, data: { jobs } });
  } catch (error) {
    return response.status(500).json({ success: false, message: "Unable to load your job postings." });
  }
};

export const createRecruiterJob = async (request, response) => {
  try {
    const job = await Job.create({
      ...pickJobFields(request.body),
      company: request.user.companyName,
      postedBy: request.user._id,
    });
    return response.status(201).json({ success: true, data: job });
  } catch (error) {
    if (error.name === "ValidationError") {
      return response.status(400).json({ success: false, message: "Complete the required job details before publishing." });
    }
    return response.status(500).json({ success: false, message: "Unable to create this job posting." });
  }
};

export const updateRecruiterJob = async (request, response) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: request.params.jobId, postedBy: request.user._id },
      { $set: pickJobFields(request.body) },
      { new: true, runValidators: true },
    );
    if (!job) return response.status(404).json({ success: false, message: "Job posting not found." });
    return response.status(200).json({ success: true, data: job });
  } catch (error) {
    if (error.name === "ValidationError") {
      return response.status(400).json({ success: false, message: "Job details are invalid." });
    }
    return response.status(500).json({ success: false, message: "Unable to update this job posting." });
  }
};

export const deleteRecruiterJob = async (request, response) => {
  try {
    const job = await Job.findOneAndDelete({ _id: request.params.jobId, postedBy: request.user._id });
    if (!job) return response.status(404).json({ success: false, message: "Job posting not found." });
    await JobApplication.deleteMany({ job: job._id });
    return response.status(200).json({ success: true, message: "Job posting and its applications were removed." });
  } catch (error) {
    return response.status(500).json({ success: false, message: "Unable to delete this job posting." });
  }
};

export const getRecruiterApplications = async (request, response) => {
  try {
    const jobs = await Job.find({ postedBy: request.user._id }).select("_id").lean();
    const applications = await JobApplication.find({ job: { $in: jobs.map((job) => job._id) } })
      .populate("candidate", "name email")
      .populate("job", "title company")
      .sort({ createdAt: -1 })
      .lean();
    return response.status(200).json({ success: true, data: { applications } });
  } catch (error) {
    return response.status(500).json({ success: false, message: "Unable to load candidate applications." });
  }
};

export const updateApplicationStatus = async (request, response) => {
  const allowedStatuses = ["reviewing", "interview", "rejected", "hired"];
  if (!allowedStatuses.includes(request.body.status)) {
    return response.status(400).json({ success: false, message: "Choose a valid application status." });
  }

  try {
    const application = await JobApplication.findById(request.params.applicationId);
    if (!application) return response.status(404).json({ success: false, message: "Application not found." });
    const ownedJob = await Job.exists({ _id: application.job, postedBy: request.user._id });
    if (!ownedJob) return response.status(404).json({ success: false, message: "Application not found." });
    application.status = request.body.status;
    await application.save();
    return response.status(200).json({ success: true, data: { id: application._id, status: application.status } });
  } catch (error) {
    return response.status(500).json({ success: false, message: "Unable to update application status." });
  }
};