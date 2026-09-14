export const buildRoadmapPrompt = ({
  targetCareer,
  skillGaps,
  availableHoursPerWeek,
}) =>
  `Create a practical learning roadmap for ${targetCareer}. Return structured JSON roadmap items with skill, level, priority, estimatedHours, prerequisites, project, and resources. Skill gaps: ${JSON.stringify(skillGaps)}. Available hours: ${availableHoursPerWeek}.`;
