import { buildChatbotPrompt } from "../prompts/chatbotPrompt.js";
import { validateChatReply, extractJson } from "./aiValidation.js";

const getFallbackReply = (message, context) => {
  const lowerMessage = message.toLowerCase();
  let answer =
    "I can help you choose a direction, improve your profile, and plan your next career steps.";

  if (
    lowerMessage.includes("career") ||
    lowerMessage.includes("path") ||
    lowerMessage.includes("job")
  ) {
    answer = `Based on your profile, your strongest direction looks like ${context.currentCareer}. Focus on portfolio work, practical projects, and the skills most relevant to that role.`;
  } else if (lowerMessage.includes("resume") || lowerMessage.includes("cv")) {
    answer =
      "Make your resume action-based: quantify project results, highlight tools and outcomes, and tailor the strongest bullets to the role you want.";
  } else if (
    lowerMessage.includes("skill") ||
    lowerMessage.includes("learn") ||
    lowerMessage.includes("study")
  ) {
    answer = `Your next focus should be ${context.gaps.slice(0, 2).join(" and ")}. Use one practical project and a weekly review cycle to turn those gaps into evidence.`;
  } else if (
    lowerMessage.includes("interview") ||
    lowerMessage.includes("prep")
  ) {
    answer =
      "Prepare concise STAR stories, explain your technical choices, and support each answer with one concrete result or metric.";
  } else if (
    lowerMessage.includes("project") ||
    lowerMessage.includes("portfolio")
  ) {
    answer =
      "Choose two or three projects that show the full lifecycle: problem, implementation, testing, deployment, and measurable outcome.";
  }

  if (context.profile) {
    answer += ` Your current profile mentions ${context.profile.degree || "your degree"} in ${context.profile.branch || "your field"}.`;
  }

  return answer;
};

export const generateAssistantReply = async ({ message, context }) => {
  if (!process.env.GEMINI_API_KEY)
    return validateChatReply(getFallbackReply(message, context));

  const model = process.env.CHATBOT_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const providerResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
                systemInstruction: {
          parts: [
            {
              text: "You are a helpful career guidance assistant. Never invent personal data. Match your reply's length and depth to the user's message — for greetings or small talk (like 'hi', 'hello', 'thanks'), reply briefly in 1-2 sentences and ask what they'd like help with. Only give detailed, structured advice (like step-by-step plans) when the user asks a specific career-related question.",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildChatbotPrompt({ message, context }) }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!providerResponse.ok)
      throw new Error(`AI provider returned ${providerResponse.status}`);

    const payload = await providerResponse.json();
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    return validateChatReply(text);
  } catch (error) {
    console.warn(
      "AI provider unavailable; using local fallback:",
      error.message,
    );
    return validateChatReply(getFallbackReply(message, context));
  }
};

export const parseStructuredResponse = (value, validator) => {
  const parsed = extractJson(value);
  return validator(parsed);
};