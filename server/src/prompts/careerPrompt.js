export const buildCareerPrompt = (context) =>
  `Recommend suitable career directions for this student. Return structured JSON with recommendations containing career, score from 0 to 100, and reason. Student context: ${JSON.stringify(context)}`;
