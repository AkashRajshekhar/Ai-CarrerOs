export const buildSkillGapPrompt = ({ targetCareer, skills }) =>
  `Compare the student's skills with the requirements for ${targetCareer}. Return structured JSON with skill, status, priority, and learningOrder fields. Student skills: ${JSON.stringify(skills)}`;
