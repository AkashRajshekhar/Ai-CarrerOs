import Interview from "../models/Interview.js";

const tips = [
  "Use a specific example from a project, course, or internship.",
  "Explain your reasoning and the result, not just the final answer.",
  "Keep your response structured and connect it to the target role.",
];

const question = (id, prompt) => ({ id, prompt, tips });

const roleTopics = {
  "Frontend Developer":
    "component architecture, accessibility, and browser performance",
  "Backend Developer": "API design, data modeling, and service reliability",
  "Full Stack Developer": "frontend integration, APIs, and end-to-end delivery",
  "React Developer": "React rendering, state management, and reusable UI",
  "Data Analyst": "SQL, data quality, and communicating business insights",
  "AI / ML Engineer":
    "model evaluation, data preparation, and machine-learning systems",
  "Cloud Engineer":
    "Linux, networking, infrastructure, and deployment automation",
  "Cloud / DevOps Engineer":
    "Linux, networking, infrastructure, and deployment automation",
  "Cybersecurity Analyst":
    "threat detection, access control, and incident response",
  "UX Designer": "user research, interaction design, and usability testing",
  "Product Manager": "customer discovery, prioritization, and product outcomes",
};

const behavioralQuestions = [
  ["story", "Tell me about a challenging project and how you handled it."],
  [
    "conflict",
    "Describe a time you disagreed with a teammate. What did you do?",
  ],
  ["failure", "Tell me about a mistake you made and what you learned from it."],
  [
    "priority",
    "How do you prioritize when several important tasks arrive together?",
  ],
  ["motivation", "Why are you interested in this role and career direction?"],
].map(([id, prompt]) => question(`behavioral-${id}`, prompt));

const hrQuestions = [
  [
    "intro",
    "Walk me through your background and the kind of work you want next.",
  ],
  [
    "strength",
    "What strength would your teammates notice first? Give an example.",
  ],
  [
    "growth",
    "What skill are you currently improving, and how are you practicing it?",
  ],
  ["team", "What kind of team environment helps you do your best work?"],
  ["company", "Why should a company choose you for this role?"],
].map(([id, prompt]) => question(`hr-${id}`, prompt));

const getQuestions = (role, interviewType) => {
  const topic =
    roleTopics[role] || `${role} fundamentals and practical problem-solving`;
  const technicalPrompts = [
    `What are the most important principles of ${topic}?`,
    `How would you debug a production issue related to ${topic}?`,
    `Design a small project that demonstrates your ability with ${topic}.`,
    `What trade-offs would you explain when choosing tools for ${topic}?`,
    `How would you test and monitor a solution involving ${topic}?`,
  ];
  const codingPrompts = [
    `Solve a practical problem commonly faced in ${role} work and explain your approach.`,
    `How would you break a large ${role} task into smaller testable steps?`,
    `Describe the edge cases you would check before shipping your solution as a ${role}.`,
    `How would you improve the performance or maintainability of a ${role} implementation?`,
    `Explain your approach while reviewing another developer's ${role} code.`,
  ];
  const prompts =
    interviewType === "Technical"
      ? technicalPrompts
      : interviewType === "Coding"
        ? codingPrompts
        : interviewType === "HR"
          ? hrQuestions
          : behavioralQuestions;
  return prompts.map((item, index) =>
    item.prompt
      ? item
      : question(`${interviewType.toLowerCase()}-${role}-${index}`, item),
  );
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
