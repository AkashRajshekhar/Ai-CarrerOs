import Assessment from "../models/Assessment.js";

const careerLibrary = {
  "Full Stack Developer": {
    title: "Full Stack Developer",
    matchLabel: "High compatibility",
    summary:
      "You are well suited to building end-to-end digital products, combining technical logic with user-facing execution.",
    reasons: [
      "Strong technical curiosity and product-minded thinking",
      "Good fit for problem-solving and collaboration",
      "Ideal for users who enjoy both frontend and backend work",
    ],
    skillGaps: [
      "API design and backend architecture",
      "Testing and deployment workflows",
      "System design fundamentals",
    ],
    roadmap: [
      "Build a full-stack project using React + Node + MongoDB",
      "Practice authentication, APIs, and deployment pipelines",
      "Learn testing, performance tuning, and Docker basics",
    ],
    roles: ["Frontend Engineer", "Full Stack Engineer", "Product Engineer"],
  },
  "Frontend Developer": {
    title: "Frontend Developer",
    matchLabel: "Strong UI focus",
    summary:
      "You likely enjoy turning interfaces into polished experiences and translating product ideas into user-friendly flows.",
    reasons: [
      "Creative product thinking and UX awareness",
      "Comfort with visual design and interaction patterns",
      "Strong fit for web and UI-first careers",
    ],
    skillGaps: [
      "Accessibility and responsiveness",
      "State management and component architecture",
      "Design systems and performance optimization",
    ],
    roadmap: [
      "Build landing pages and dashboards with real interaction patterns",
      "Study accessibility and component libraries",
      "Practice performance tuning and design consistency",
    ],
    roles: ["UI Engineer", "React Developer", "Web Developer"],
  },
  "Backend Developer": {
    title: "Backend Developer",
    matchLabel: "Analytical strength",
    summary:
      "You are likely comfortable with systems thinking, data flow, and solving technical complexity behind the scenes.",
    reasons: [
      "Structured problem-solving mindset",
      "Strong fit for APIs, data, and architecture work",
      "Good potential for building scalable systems",
    ],
    skillGaps: [
      "Database design and indexing",
      "Distributed systems basics",
      "Security and observability",
    ],
    roadmap: [
      "Build a secure API with auth, validation, and data modeling",
      "Explore SQL + NoSQL tradeoffs and indexing",
      "Practice debugging, logging, and scaling patterns",
    ],
    roles: ["Backend Engineer", "Platform Engineer", "API Engineer"],
  },
  "AI / ML Engineer": {
    title: "AI / ML Engineer",
    matchLabel: "High analytical potential",
    summary:
      "You have the traits of someone who enjoys technical depth, experimentation, and turning complex data into useful outcomes.",
    reasons: [
      "Comfort with mathematics and logic",
      "Curiosity for emerging technologies",
      "Good fit for exploratory and model-driven work",
    ],
    skillGaps: [
      "Statistics and probability fundamentals",
      "Model evaluation and experimentation",
      "Data preparation and feature design",
    ],
    roadmap: [
      "Study Python, data analysis, and ML workflows",
      "Work on small predictive projects with real data",
      "Learn model evaluation and deployment basics",
    ],
    roles: ["ML Engineer", "Data Scientist", "Applied AI Engineer"],
  },
  "Data Analyst": {
    title: "Data Analyst",
    matchLabel: "Insight-driven match",
    summary:
      "You may thrive in turning raw information into understandable narratives, dashboards, and actionable decisions.",
    reasons: [
      "Analytical thinking and structured reasoning",
      "Good fit for communication and business insight",
      "Strong pattern recognition and trend interpretation",
    ],
    skillGaps: [
      "Data storytelling and KPI framing",
      "SQL and dashboarding tools",
      "Business context and reporting design",
    ],
    roadmap: [
      "Practice SQL queries and business analysis cases",
      "Build dashboards and scenario analysis reports",
      "Improve data storytelling and presentation",
    ],
    roles: ["Data Analyst", "BI Analyst", "Product Analyst"],
  },
  "Cloud / DevOps Engineer": {
    title: "Cloud / DevOps Engineer",
    matchLabel: "Systems and operations fit",
    summary:
      "You likely enjoy making systems dependable, scalable, and efficient while balancing technical operations and delivery.",
    reasons: [
      "Strong interest in technology infrastructure",
      "Comfort with structured execution and process thinking",
      "Good fit for automation and deployment workflows",
    ],
    skillGaps: [
      "Linux and networking basics",
      "CI/CD and cloud services",
      "Monitoring and incident response",
    ],
    roadmap: [
      "Learn Linux, networking, and cloud fundamentals",
      "Practice CI/CD with GitHub Actions or GitLab",
      "Set up deployment pipelines and monitoring stacks",
    ],
    roles: ["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer"],
  },
  "UX Designer": {
    title: "UX Designer",
    matchLabel: "Creative product fit",
    summary:
      "Your answers suggest a strong fit for understanding people, shaping experiences, and turning ideas into clear product flows.",
    reasons: [
      "Creative and user-focused thinking",
      "Strong communication and collaboration potential",
      "Good fit for design and product discovery",
    ],
    skillGaps: [
      "User research and usability testing",
      "Interaction design and prototyping",
      "Accessibility and design systems",
    ],
    roadmap: [
      "Practice user interviews and journey mapping",
      "Build prototypes in Figma and test them",
      "Create an accessible case-study portfolio",
    ],
    roles: ["UX Designer", "Product Designer", "Interaction Designer"],
  },
  "Cybersecurity Analyst": {
    title: "Cybersecurity Analyst",
    matchLabel: "Security-minded fit",
    summary:
      "You show potential for structured investigation, technical awareness, and dependable security operations.",
    reasons: [
      "Analytical problem-solving",
      "Interest in technology and systems",
      "Good fit for investigation and process-driven work",
    ],
    skillGaps: [
      "Networking and Linux fundamentals",
      "Threat detection and incident response",
      "Security tools and access control",
    ],
    roadmap: [
      "Learn networking, Linux, and common attack patterns",
      "Practice log analysis in a home lab",
      "Document security investigations as portfolio projects",
    ],
    roles: ["Security Analyst", "SOC Analyst", "Application Security Analyst"],
  },
  "Product Manager": {
    title: "Product Manager",
    matchLabel: "Product-thinking fit",
    summary:
      "You may thrive at the intersection of customer needs, communication, prioritization, and practical delivery.",
    reasons: [
      "Clear communication and collaboration",
      "Interest in solving meaningful user problems",
      "Good potential for structured prioritization",
    ],
    skillGaps: [
      "Customer discovery and interviews",
      "Product metrics and analytics",
      "Roadmapping and stakeholder alignment",
    ],
    roadmap: [
      "Run a small customer discovery exercise",
      "Write product requirements and success metrics",
      "Build a case study from idea through validation",
    ],
    roles: [
      "Associate Product Manager",
      "Product Analyst",
      "Growth Product Manager",
    ],
  },
  "QA Automation Engineer": {
    title: "QA Automation Engineer",
    matchLabel: "Quality-focused fit",
    summary:
      "Your profile can fit careful, technical work that improves product quality through repeatable checks and thoughtful investigation.",
    reasons: [
      "Structured problem-solving",
      "Interest in technology and reliable delivery",
      "Good fit for debugging and continuous improvement",
    ],
    skillGaps: [
      "Test strategy and automation",
      "API and browser testing",
      "CI pipelines and defect analysis",
    ],
    roadmap: [
      "Learn test design and Playwright basics",
      "Automate a realistic web application flow",
      "Run tests in CI and report defects clearly",
    ],
    roles: ["QA Automation Engineer", "Test Engineer", "SDET"],
  },
};

export const getRecommendation = async (request, response) => {
  try {
    const assessment = await Assessment.findOne({
      user: request.user._id,
    }).lean();

    if (!assessment || !assessment.result) {
      return response.status(404).json({
        success: false,
        message: "No assessment found for this user.",
      });
    }

    const profile = careerLibrary[assessment.result.topCareer] || {
      title: assessment.result.topCareer,
      matchLabel: "Promising fit",
      summary:
        "Your assessment suggests a strong direction in this career path. Keep refining your strengths with practical projects and exposure.",
      reasons: assessment.result.strengths,
      skillGaps: assessment.result.gaps,
      roadmap: assessment.result.recommendations,
      roles: [assessment.result.topCareer],
    };

    const compatibility = Math.min(
      98,
      Math.max(60, assessment.result.averageScore || 75),
    );

    return response.status(200).json({
      success: true,
      data: {
        career: profile.title,
        compatibility: Math.round(compatibility),
        matchLabel: profile.matchLabel,
        summary: profile.summary,
        reasons: profile.reasons,
        skillGaps: profile.skillGaps,
        roadmap: profile.roadmap,
        roles: profile.roles,
      },
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to generate career recommendation.",
      error: error.message,
    });
  }
};
