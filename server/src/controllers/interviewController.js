import Interview from "../models/Interview.js";

const baseQuestions = [
  {
    id: "self-intro",
    prompt: "Tell me about yourself and your career direction.",
    tips: [
      "Keep it structured: present, past, future.",
      "Tie your story to your target career.",
      "Focus on skills, projects, and motivation.",
    ],
  },
  {
    id: "strengths",
    prompt: "What is one of your biggest strengths and how have you used it?",
    tips: [
      "Use a concrete example.",
      "Explain the situation, action, and outcome.",
      "Connect it to the role you want.",
    ],
  },
  {
    id: "weakness",
    prompt: "What is one area you are improving and how are you addressing it?",
    tips: [
      "Choose a real but manageable weakness.",
      "Show self-awareness and initiative.",
      "Describe what you are doing to improve.",
    ],
  },
  {
    id: "project",
    prompt: "Describe a project you are proud of and the impact it had.",
    tips: [
      "Use the STAR method.",
      "Highlight the problem, your approach, and the result.",
      "Include metrics or user impact whenever possible.",
    ],
  },
  {
    id: "motivation",
    prompt: "Why do you want to work in this field or company?",
    tips: [
      "Be specific about the role and company.",
      "Connect your interests to value you can create.",
      "Show long-term motivation, not just a vague preference.",
    ],
  },
];

const roleQuestions = {
  "Frontend Developer":
    "Explain how you would make a React interface accessible and responsive.",
  "Backend Developer":
    "How would you design and secure a REST API for a production application?",
  "Full Stack Developer":
    "Describe how you would build and deploy a full-stack feature end to end.",
  "AI / ML Engineer":
    "Explain how you would evaluate whether a machine-learning model is useful.",
};

const getQuestions = (role, interviewType) => {
  const questions = [...baseQuestions];
  if (roleQuestions[role]) {
    questions[3] = { ...questions[3], prompt: roleQuestions[role] };
  }
  if (interviewType === "Technical" || interviewType === "Coding") {
    questions[1] = {
      ...questions[1],
      prompt: `Explain one important technical concept for a ${role} and give a practical example.`,
    };
  }
  if (interviewType === "HR") {
    questions[4] = {
      ...questions[4],
      prompt:
        "Why should a company choose you, and how do you work with a team?",
    };
  }
  return questions;
};

export const getInterviewQuestions = (request, response) => {
  const role = request.query.role || "Full Stack Developer";
  const difficulty = request.query.difficulty || "Intermediate";
  const interviewType = request.query.type || "Behavioral";
  return response.status(200).json({
    success: true,
    data: {
      role,
      difficulty,
      interviewType,
      questions: getQuestions(role, interviewType),
    },
  });
};

export const submitInterview = async (request, response) => {
  try {
    const {
      answers,
      textAnswers = {},
      role = "Full Stack Developer",
      difficulty = "Intermediate",
      interviewType = "Behavioral",
    } = request.body;
    const questions = getQuestions(role, interviewType);

    if (!answers || typeof answers !== "object") {
      return response.status(400).json({
        success: false,
        message: "Please submit interview answers.",
      });
    }

    const values = Object.values(answers)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    if (values.length !== questions.length) {
      return response.status(400).json({
        success: false,
        message: "Please answer every interview question.",
      });
    }

    const average =
      values.reduce((sum, value) => sum + value, 0) / values.length;
    const score = Math.round((average / 5) * 100);

    let summary = "You are building a solid interview foundation.";
    if (score >= 85)
      summary =
        "Excellent interview readiness. Your responses show strong clarity and confidence.";
    else if (score >= 70)
      summary =
        "Good potential. A few improvements will make your answers sharper and more structured.";
    else if (score >= 50)
      summary =
        "You have a decent starting point. Focus on more structured examples and clear storytelling.";
    else
      summary =
        "You are in the early stage of interview prep. Work on structure, examples, and confidence.";

    const recommendations = [
      "Use the STAR method to answer behavioral questions with clearer structure.",
      "Add one concrete result or metric to each example to strengthen impact.",
      "Practice delivering answers in under 90 seconds with confident wording.",
    ];

    const writtenAnswers = Object.values(textAnswers).filter(
      (answer) => typeof answer === "string" && answer.trim(),
    );
    const textBonus = writtenAnswers.length
      ? Math.min(
          10,
          writtenAnswers.reduce(
            (sum, answer) =>
              sum + Math.min(answer.trim().split(/\s+/).length, 80) / 16,
            0,
          ) / writtenAnswers.length,
        )
      : 0;
    const evaluation = {
      technicalAccuracy: Math.min(10, Math.round(average * 2)),
      clarity: Math.min(10, Math.round(average * 2 + (textBonus > 3 ? 1 : 0))),
      completeness: Math.min(
        10,
        Math.round(
          average * 2 + (writtenAnswers.length === questions.length ? 1 : 0),
        ),
      ),
    };
    const feedback = [
      "Use the STAR method for behavioral answers and include a measurable result.",
      writtenAnswers.length
        ? "Your written answers give useful context; add a concrete example where possible."
        : "Add written examples to receive more specific feedback.",
      "Practice delivering each answer in under 90 seconds with clear structure.",
    ];
    const session = await Interview.create({
      user: request.user._id,
      role,
      difficulty,
      interviewType,
      answers: questions.map((question) => ({
        questionId: question.id,
        text: textAnswers[question.id] || "",
        rating: Number(answers[question.id]),
      })),
      score: Math.min(100, Math.round((average / 5) * 90 + textBonus)),
      evaluation,
      feedback,
    });

    return response.status(200).json({
      success: true,
      data: {
        id: session._id,
        score: session.score,
        summary,
        recommendations: feedback,
        evaluation,
      },
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to evaluate interview responses.",
      error: error.message,
    });
  }
};
