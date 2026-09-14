const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const extractJson = (value) => {
  if (isPlainObject(value) || Array.isArray(value)) return value;
  if (typeof value !== "string")
    throw new Error("AI response must be text or JSON");

  const cleaned = value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.search(/[\[{]/);
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start === -1 || end <= start)
      throw new Error("AI response did not contain valid JSON");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
};

const assertScore = (value, field) => {
  if (
    !Number.isFinite(Number(value)) ||
    Number(value) < 0 ||
    Number(value) > 100
  ) {
    throw new Error(`${field} must be between 0 and 100`);
  }
};

const assertStringArray = (value, field) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${field} must be an array of strings`);
  }
};

export const validateCareerResponse = (value) => {
  const data = extractJson(value);
  if (!isPlainObject(data) || !Array.isArray(data.recommendations))
    throw new Error("Career response is missing recommendations");
  data.recommendations.forEach((item) => {
    if (
      !isPlainObject(item) ||
      typeof item.career !== "string" ||
      typeof item.reason !== "string"
    )
      throw new Error("Invalid career recommendation");
    assertScore(item.score, "career score");
  });
  return data;
};

export const validateResumeResponse = (value) => {
  const data = extractJson(value);
  if (!isPlainObject(data))
    throw new Error("Resume response must be an object");
  assertScore(data.score, "resume score");
  if (data.atsScore !== undefined) assertScore(data.atsScore, "ATS score");
  ["skills", "strengths", "weaknesses", "suggestions", "missingSkills"].forEach(
    (field) => assertStringArray(data[field] || [], field),
  );
  return data;
};

export const validateSkillGapResponse = (value) => {
  const data = extractJson(value);
  if (!isPlainObject(data) || !Array.isArray(data.skills))
    throw new Error("Skill-gap response is missing skills");
  data.skills.forEach((item) => {
    if (
      !isPlainObject(item) ||
      typeof item.skill !== "string" ||
      typeof item.status !== "string" ||
      typeof item.priority !== "string"
    )
      throw new Error("Invalid skill-gap item");
  });
  if (data.learningOrder !== undefined)
    assertStringArray(data.learningOrder, "learningOrder");
  return data;
};

export const validateRoadmapResponse = (value) => {
  const data = extractJson(value);
  const items = Array.isArray(data) ? data : data?.items;
  if (!Array.isArray(items))
    throw new Error("Roadmap response is missing items");
  items.forEach((item) => {
    if (
      !isPlainObject(item) ||
      typeof item.skill !== "string" ||
      typeof item.priority !== "string"
    )
      throw new Error("Invalid roadmap item");
    if (
      !Number.isFinite(Number(item.estimatedHours)) ||
      Number(item.estimatedHours) < 1
    )
      throw new Error("estimatedHours must be positive");
  });
  return data;
};

export const validateInterviewResponse = (value) => {
  const data = extractJson(value);
  if (!isPlainObject(data) || !Array.isArray(data.questions))
    throw new Error("Interview response is missing questions");
  data.questions.forEach((item) => {
    if (
      !isPlainObject(item) ||
      typeof item.prompt !== "string" ||
      !Array.isArray(item.tips)
    )
      throw new Error("Invalid interview question");
    assertStringArray(item.tips, "question tips");
  });
  return data;
};

export const validateChatReply = (value) => {
  if (typeof value !== "string" || !value.trim() || value.length > 4000)
    throw new Error(
      "Assistant reply must be a non-empty text under 4000 characters",
    );
  return value.trim();
};
