import Profile from "../models/Profile.js";

export const getProfile = async (request, response) => {
  try {
    const profile = await Profile.findOne({ user: request.user._id }).lean();

    if (!profile) {
      return response.status(200).json({
        success: true,
        data: null,
      });
    }

    return response.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to fetch profile",
      error: error.message,
    });
  }
};

export const createOrUpdateProfile = async (request, response) => {
  try {
    const body = request.body || {};
    const arraySections = [
      "programmingLanguages",
      "frameworks",
      "databases",
      "tools",
    ];
    const experienceSections = [
      "projects",
      "internships",
      "certifications",
      "achievements",
    ];
    const skills = Object.fromEntries(
      arraySections.map((section) => [
        section,
        Array.isArray(body.skills?.[section])
          ? body.skills[section].filter(Boolean)
          : [],
      ]),
    );
    const experience = Object.fromEntries(
      experienceSections.map((section) => [
        section,
        Array.isArray(body.experience?.[section])
          ? body.experience[section].filter(Boolean)
          : [],
      ]),
    );
    const profileData = {
      ...body,
      skills,
      experience,
      user: request.user._id,
    };

    const profile = await Profile.findOneAndUpdate(
      { user: request.user._id },
      { $set: profileData },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return response.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to save profile",
      error: error.message,
    });
  }
};
