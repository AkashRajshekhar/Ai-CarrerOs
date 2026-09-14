export const buildInterviewPrompt = ({ role, difficulty, interviewType }) =>
  `Generate interview preparation content for ${role}. Difficulty: ${difficulty}. Type: ${interviewType}. Return structured questions with prompts and tips, plus evaluation guidance.`;
