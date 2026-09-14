import Assessment from "../models/Assessment.js";
import ChatHistory from "../models/ChatHistory.js";
import Profile from "../models/Profile.js";
import { generateAssistantReply } from "../services/aiService.js";

const buildAssistantContext = async (userId) => {
  const [assessment, profile] = await Promise.all([
    Assessment.findOne({ user: userId }).lean(),
    Profile.findOne({ user: userId }).lean(),
  ]);

  return {
    currentCareer: assessment?.result?.topCareer || "Career exploration",
    strengths: assessment?.result?.strengths || [
      "Keep building practical experience",
    ],
    gaps: assessment?.result?.gaps || ["Develop more technical depth"],
    profile: profile
      ? {
          degree: profile.degree,
          branch: profile.branch,
          college: profile.college,
          careerInterests: profile.careerInterests || [],
        }
      : null,
  };
};

export const getChatHistory = async (request, response) => {
  try {
    const history = await ChatHistory.findOne({
      user: request.user._id,
    }).lean();
    return response.status(200).json({
      success: true,
      data: history?.messages || [],
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to load assistant history.",
    });
  }
};

export const getAssistantReply = async (request, response) => {
  try {
    const message = request.body.message?.trim();
    if (!message) {
      return response.status(400).json({
        success: false,
        message: "Please enter a message for the assistant.",
      });
    }

    const context = await buildAssistantContext(request.user._id);
    const reply = await generateAssistantReply({ message, context });
    const history = await ChatHistory.findOneAndUpdate(
      { user: request.user._id },
      {
        $setOnInsert: { user: request.user._id },
        $push: {
          messages: {
            $each: [
              { role: "user", content: message },
              { role: "assistant", content: reply },
            ],
            $slice: -40,
          },
        },
      },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    return response.status(200).json({
      success: true,
      data: {
        reply,
        context,
        messages: history.messages,
      },
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to generate assistant response.",
    });
  }
};
