import mongoose from "mongoose";
import Roadmap from "../models/Roadmap.js";
import SkillGap from "../models/SkillGap.js";

const getLevel = (status) => {
  if (status === "Beginner") return "Beginner";
  if (status === "Intermediate") return "Intermediate";
  return "Advanced";
};

const createItems = (skillGap) =>
  skillGap.skills
    .filter((skill) => skill.status !== "Mastered")
    .sort(
      (left, right) =>
        ({ High: 0, Medium: 1, Low: 2 })[left.priority] -
        { High: 0, Medium: 1, Low: 2 }[right.priority],
    )
    .map((skill) => ({
      skill: skill.name,
      level: getLevel(skill.status),
      priority: skill.priority,
      estimatedHours:
        skill.priority === "High" ? 18 : skill.priority === "Medium" ? 12 : 8,
      description: `Build practical ${skill.name} confidence for a ${skillGap.targetCareer} role.`,
      prerequisites:
        skill.status === "Missing"
          ? ["Review fundamentals", "Complete a small guided exercise"]
          : ["Review your current notes"],
      project: `Build a small ${skill.name} project connected to ${skillGap.targetCareer}.`,
      completed: false,
    }));

const calculateProgress = (items) =>
  items.length
    ? Math.round(
        (items.filter((item) => item.completed).length / items.length) * 100,
      )
    : 0;

export const getRoadmap = async (request, response) => {
  try {
    const roadmap = await Roadmap.findOne({ user: request.user._id }).lean();
    if (!roadmap)
      return response
        .status(404)
        .json({
          success: false,
          message:
            "Generate a roadmap after completing your skill-gap analysis.",
        });
    return response.status(200).json({ success: true, data: roadmap });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to load your roadmap." });
  }
};

export const generateRoadmap = async (request, response) => {
  try {
    const requestedHours = Number(request.body.availableHoursPerWeek || 8);
    if (
      !Number.isFinite(requestedHours) ||
      requestedHours < 1 ||
      requestedHours > 80
    ) {
      return response
        .status(400)
        .json({
          success: false,
          message: "Available hours must be between 1 and 80 per week.",
        });
    }

    const skillGap = await SkillGap.findOne({ user: request.user._id }).lean();
    if (!skillGap)
      return response
        .status(404)
        .json({
          success: false,
          message: "Complete a skill-gap analysis before generating a roadmap.",
        });

    const items = createItems(skillGap);
    const roadmap = await Roadmap.findOneAndUpdate(
      { user: request.user._id },
      {
        $set: {
          user: request.user._id,
          targetCareer: skillGap.targetCareer,
          availableHoursPerWeek: requestedHours,
          items,
          progress: 0,
        },
      },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    return response
      .status(200)
      .json({
        success: true,
        message: "Roadmap generated successfully.",
        data: roadmap,
      });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to generate your roadmap." });
  }
};

export const updateRoadmapItem = async (request, response) => {
  try {
    if (!mongoose.isValidObjectId(request.params.itemId))
      return response
        .status(400)
        .json({ success: false, message: "Invalid roadmap item." });
    const completed = request.body.completed === true;
    const roadmap = await Roadmap.findOne({ user: request.user._id });
    if (!roadmap)
      return response
        .status(404)
        .json({ success: false, message: "Roadmap not found." });

    const item = roadmap.items.id(request.params.itemId);
    if (!item)
      return response
        .status(404)
        .json({ success: false, message: "Roadmap item not found." });
    item.completed = completed;
    roadmap.progress = calculateProgress(roadmap.items);
    await roadmap.save();

    return response.status(200).json({ success: true, data: roadmap });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to update roadmap progress." });
  }
};
