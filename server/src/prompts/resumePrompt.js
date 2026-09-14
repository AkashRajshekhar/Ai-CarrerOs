export const buildResumePrompt = (resumeText) =>
  `Analyze this resume text. Return structured JSON with score, atsScore, skills, strengths, weaknesses, suggestions, and missingSkills. Resume text: ${resumeText}`;
