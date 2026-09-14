import User from "../models/User.js";
import Job from "../models/Job.js";

export const getAdminOverview = async (_request, response) => {
  try {
    const [totalUsers, students, admins, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    return response.status(200).json({
      success: true,
      data: { stats: { totalUsers, students, admins }, users: recentUsers },
    });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to load admin overview." });
  }
};

export const updateUserRole = async (request, response) => {
  try {
    const { role } = request.body;
    if (!["student", "admin"].includes(role)) {
      return response
        .status(400)
        .json({ success: false, message: "Role must be student or admin." });
    }
    if (
      String(request.user._id) === request.params.userId &&
      role !== "admin"
    ) {
      return response.status(400).json({
        success: false,
        message: "You cannot remove your own admin access.",
      });
    }

    const user = await User.findByIdAndUpdate(
      request.params.userId,
      { $set: { role } },
      { new: true, runValidators: true },
    ).select("name email role createdAt");
    if (!user)
      return response
        .status(404)
        .json({ success: false, message: "User not found." });
    return response.status(200).json({ success: true, data: user });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to update user role." });
  }
};

export const deleteUser = async (request, response) => {
  try {
    if (String(request.user._id) === request.params.userId) {
      return response.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }
    const user = await User.findByIdAndDelete(request.params.userId);
    if (!user)
      return response
        .status(404)
        .json({ success: false, message: "User not found." });
    return response
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to delete user." });
  }
};

const jobFields = [
  "title",
  "company",
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

export const createJob = async (request, response) => {
  try {
    const job = await Job.create(pickJobFields(request.body));
    return response.status(201).json({ success: true, data: job });
  } catch (error) {
    return response
      .status(400)
      .json({ success: false, message: "Unable to create job." });
  }
};

export const updateJob = async (request, response) => {
  try {
    const job = await Job.findByIdAndUpdate(
      request.params.jobId,
      { $set: pickJobFields(request.body) },
      { new: true, runValidators: true },
    );
    if (!job)
      return response
        .status(404)
        .json({ success: false, message: "Job not found." });
    return response.status(200).json({ success: true, data: job });
  } catch (error) {
    return response
      .status(400)
      .json({ success: false, message: "Unable to update job." });
  }
};

export const deleteJob = async (request, response) => {
  try {
    const job = await Job.findByIdAndDelete(request.params.jobId);
    if (!job)
      return response
        .status(404)
        .json({ success: false, message: "Job not found." });
    return response
      .status(200)
      .json({ success: true, message: "Job deleted successfully." });
  } catch (error) {
    return response
      .status(400)
      .json({ success: false, message: "Unable to delete job." });
  }
};
