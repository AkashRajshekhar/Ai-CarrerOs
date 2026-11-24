import { buildChatbotPrompt } from "../prompts/chatbotPrompt.js";
import { validateChatReply, extractJson } from "./aiValidation.js";

const getFallbackReply = (message, context) => {
  const lowerMessage = message.toLowerCase();
  const career = context.currentCareer || "your target role";
  const gaps = (context.gaps || []).slice(0, 2);
  let answer;

  if (lowerMessage.includes("interview") || lowerMessage.includes("prep")) {
    answer = `For a ${career} interview, prepare one concise example each for problem-solving, collaboration, and handling a setback. Practice explaining your decisions aloud, then use a role-specific question set to find gaps.`;
  } else if (lowerMessage.includes("resume") || lowerMessage.includes("cv")) {
    answer = `For your ${career} resume, tailor the top third to the role, then rewrite project bullets as action + technical choice + outcome. Add numbers only when you can support them with real results.`;
  } else if (lowerMessage.includes("portfolio") || lowerMessage.includes("project")) {
    answer = `For a ${career} portfolio, choose one project that demonstrates core skills and one that shows your problem-solving. Include a live demo, a concise README, tests, and a short note explaining trade-offs.`;
  } else if (lowerMessage.includes("skill") || lowerMessage.includes("learn") || lowerMessage.includes("study")) {
    answer = gaps.length
      ? `Your recorded focus areas are ${gaps.join(" and ")}. Pick one, build a small role-relevant feature with it, and publish the result with a short explanation of what you learned.`
      : `For ${career}, compare three current job descriptions and list the skills they repeatedly require. Choose one gap, complete a small project around it, and add the project as evidence to your profile.`;
  } else if (lowerMessage.includes("salary") || lowerMessage.includes("negotia")) {
    answer = "Before discussing compensation, research the range for your location and level, write down your evidence of impact, and decide on a target and a minimum you would accept. Keep the conversation collaborative and ask about the full package.";
  } else if (lowerMessage.includes("job") || lowerMessage.includes("apply") || lowerMessage.includes("search")) {
    answer = `For ${career} roles, compare each posting against your strongest projects and required skills. Prioritize a small number of close matches, tailor your resume to each, and keep a simple record of applications and follow-ups.`;
  } else if (lowerMessage.includes("career") || lowerMessage.includes("path") || lowerMessage.includes("direction")) {
    answer = `Your current direction is ${career}. Validate it with a small project and conversations with people in the role; then compare the day-to-day work and required skills against what you enjoy doing.`;
  } else {
    answer = `I can help with career planning, ${career} skills, resumes, portfolios, job applications, or interview preparation. Which of those would you like to work on?`;
  }

  if (context.profile) {
    answer += ` Your current profile mentions ${context.profile.degree || "your degree"} in ${context.profile.branch || "your field"}.`;
  }

  return answer;
};

export const generateAssistantReply = async ({ message, context }) => {
  if (!process.env.GEMINI_API_KEY)
    return validateChatReply(getFallbackReply(message, context));

  const models = [...new Set([
    process.env.CHATBOT_MODEL,
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
  ].filter(Boolean))];
  let lastError;

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const providerResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "You are a career guidance assistant. Give specific, useful answers to the user's actual question, use profile context only when relevant, and never invent personal data.",
              }],
            },
            contents: [{
              role: "user",
              parts: [{ text: buildChatbotPrompt({ message, context }) }],
            }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 1200 },
          }),
          signal: controller.signal,
        },
      );

      if (!providerResponse.ok) {
        lastError = new Error(`AI provider returned ${providerResponse.status}`);
        if ([400, 401, 403].includes(providerResponse.status)) break;
        continue;
      }

      const payload = await providerResponse.json();
      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return validateChatReply(text);
      lastError = new Error("AI provider returned an empty response.");
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  console.warn("All configured assistant models failed; returning local guidance:", lastError?.message);
  return validateChatReply(getFallbackReply(message, context));
};

export const parseStructuredResponse = (value, validator) => {
  const parsed = extractJson(value);
  return validator(parsed);
};