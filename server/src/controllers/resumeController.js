import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import axios from "axios";
import ResumeAnalysis from "../models/ResumeAnalysis.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/*
|--------------------------------------------------------------------------
| PDF TEXT EXTRACTION
|--------------------------------------------------------------------------
*/

const parseResumeText = async (filePath) => {
  const data = new Uint8Array(fs.readFileSync(filePath));

  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  let extractedText = "";

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber += 1
  ) {
    const page = await pdf.getPage(pageNumber);

    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => item.str)
      .join(" ");

    extractedText += pageText + "\n";
  }

  return extractedText.trim();
};

/*
|--------------------------------------------------------------------------
| GEMINI API REQUEST WITH RETRY
|--------------------------------------------------------------------------
*/

const callGeminiWithRetry = async ({
  apiUrl,
  apiKey,
  requestBody,
  maxRetries = 3,
}) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      console.log(
        `Gemini API request attempt ${attempt}/${maxRetries}...`,
      );

      const response = await axios.post(
        apiUrl,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          timeout: 30000,
        },
      );

      return response;

    } catch (error) {
      lastError = error;

      const status = error.response?.status;

      console.error(
        `Gemini API request failed. Status: ${status || "unknown"}`,
      );

      /*
      |--------------------------------------------------------------------------
      | RETRY ONLY FOR TEMPORARY ERRORS
      |--------------------------------------------------------------------------
      */

      const shouldRetry =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT";

      if (!shouldRetry || attempt === maxRetries) {
        break;
      }

      const delay = attempt * 1200;

      console.log(
        `Retrying Gemini API in ${delay / 1000} seconds...`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay),
      );
    }
  }

  throw lastError;
};

/*
|--------------------------------------------------------------------------
| AI RESUME ANALYZER
|--------------------------------------------------------------------------
*/

export const analyzeResumeWithAI = async (resumeText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing in your .env file.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MODEL LIST (PRIMARY + FALLBACKS)
  |--------------------------------------------------------------------------
  |
  | 1. process.env.GEMINI_MODEL is tried first, if set.
  | 2. gemini-3.6-flash is the default primary model.
  | 3. If the primary model fails (after its own retries) with a
  |    temporary/availability error, we automatically fall back to
  |    the next model in this list instead of failing the whole request.
  |
  */

  const modelsToTry = [
    process.env.GEMINI_MODEL,
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
  ].filter(Boolean);

  // Remove duplicates while keeping order.
  const uniqueModels = [...new Set(modelsToTry)];

  /*
  |--------------------------------------------------------------------------
  | LIMIT RESUME TEXT
  |--------------------------------------------------------------------------
  */

  const limitedText = resumeText.slice(0, 30000);

  /*
  |--------------------------------------------------------------------------
  | AI PROMPT
  |--------------------------------------------------------------------------
  */

  const prompt = `
You are an expert ATS Resume Analyzer and Career Coach.

Analyze the resume below deeply.

RESUME:
--------------------------------------------------
${limitedText}
--------------------------------------------------

Evaluate:

1. Overall resume quality
2. ATS compatibility
3. Technical skills
4. Soft skills
5. Projects
6. Experience
7. Education
8. Achievements
9. Quantifiable impact
10. Missing skills
11. Resume structure
12. Action verbs
13. Job readiness
14. Recommended career roles

IMPORTANT:

- Do not invent information.
- Only use information present in the resume.
- Give practical suggestions.
- Assume the candidate may be a college student / early-career developer.
- Score should realistically reflect resume quality.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not write anything outside JSON.

Return exactly this JSON structure:

{
  "score": 0,
  "atsScore": 0,

  "summary": "",

  "strengths": [
    "",
    "",
    ""
  ],

  "gaps": [
    "",
    "",
    ""
  ],

  "suggestions": [
    "",
    "",
    "",
    ""
  ],

  "technicalSkills": [],
  "softSkills": [],
  "missingSkills": [],

  "experienceFeedback": "",

  "projectFeedback": "",

  "educationFeedback": "",

  "recommendedRoles": []
}

Scoring:

0-40   = Very weak
41-59  = Needs major improvement
60-69  = Developing
70-79  = Good
80-89  = Strong
90-100 = Excellent

ATS score should evaluate:

- Standard sections
- Keywords
- Readability
- Skills
- Experience
- Projects
- Formatting compatibility
- Action verbs
- Measurable achievements
`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],

    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 3000,
      responseMimeType: "application/json",
    },
  };

  /*
  |--------------------------------------------------------------------------
  | TRY EACH MODEL IN ORDER UNTIL ONE SUCCEEDS
  |--------------------------------------------------------------------------
  */

  let apiResponse;
  let lastError;

  for (const model of uniqueModels) {
    const apiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    console.log(`Using Gemini model: ${model}`);

    try {
      apiResponse = await callGeminiWithRetry({
        apiUrl,
        apiKey,
        requestBody,
        maxRetries: 1,
      });

      // Success — stop trying further models.
      break;

    } catch (error) {
      lastError = error;

      const status = error.response?.status;

      console.error(
        `Model "${model}" failed with status ${status || "unknown"}.`,
      );

      const isModelLevelIssue =
        !status ||
        status === 408 ||
        status === 429 ||
        status === 404 ||
        status === 503 ||
        status === 500 ||
        status === 502 ||
        status === 504;

      const isLastModel =
        model === uniqueModels[uniqueModels.length - 1];

      if (!isModelLevelIssue || isLastModel) {
        // Not a model-availability issue (e.g. 400/401/403),
        // or we've run out of fallback models — give up.
        throw lastError;
      }

      console.log(
        `Falling back to the next Gemini model...`,
      );
    }
  }

  if (!apiResponse) {
    throw lastError || new Error("All Gemini models failed.");
  }

  /*
  |--------------------------------------------------------------------------
  | GET AI CONTENT
  |--------------------------------------------------------------------------
  */

  let aiContent =
    apiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!aiContent) {
    throw new Error(
      "AI returned an empty response.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CLEAN JSON
  |--------------------------------------------------------------------------
  */

  aiContent = aiContent
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  /*
  |--------------------------------------------------------------------------
  | PARSE JSON
  |--------------------------------------------------------------------------
  */

  let analysis;

  try {
    analysis = JSON.parse(aiContent);
  } catch (error) {
    console.error(
      "Invalid AI JSON response.",
    );

    throw new Error(
      "AI returned invalid JSON.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE SCORE
  |--------------------------------------------------------------------------
  */

  const score = Math.min(
    100,
    Math.max(
      0,
      Number(analysis.score) || 0,
    ),
  );

  const atsScore = Math.min(
    100,
    Math.max(
      0,
      Number(analysis.atsScore) || 0,
    ),
  );

  /*
  |--------------------------------------------------------------------------
  | PREPARE STRENGTHS
  |--------------------------------------------------------------------------
  */

  const strengths =
    Array.isArray(analysis.strengths)
      ? analysis.strengths
      : [];

  /*
  |--------------------------------------------------------------------------
  | PREPARE GAPS
  |--------------------------------------------------------------------------
  */

  const gaps =
    Array.isArray(analysis.gaps)
      ? analysis.gaps
      : [];

  /*
  |--------------------------------------------------------------------------
  | PREPARE SUGGESTIONS
  |--------------------------------------------------------------------------
  */

  const suggestions =
    Array.isArray(analysis.suggestions)
      ? analysis.suggestions
      : [];

  /*
  |--------------------------------------------------------------------------
  | TECHNICAL SKILLS
  |--------------------------------------------------------------------------
  */

  const technicalSkills =
    Array.isArray(analysis.technicalSkills)
      ? analysis.technicalSkills
      : [];

  /*
  |--------------------------------------------------------------------------
  | SOFT SKILLS
  |--------------------------------------------------------------------------
  */

  const softSkills =
    Array.isArray(analysis.softSkills)
      ? analysis.softSkills
      : [];

  /*
  |--------------------------------------------------------------------------
            timeout: 20000,
  |--------------------------------------------------------------------------
  */

  const missingSkills =
    Array.isArray(analysis.missingSkills)
      ? analysis.missingSkills
      : [];

  /*
  |--------------------------------------------------------------------------
  | RECOMMENDED ROLES
  |--------------------------------------------------------------------------
  */

  const recommendedRoles =
    Array.isArray(analysis.recommendedRoles)
      ? analysis.recommendedRoles
      : [];

  /*
  |--------------------------------------------------------------------------
  | CREATE SUMMARY
  |--------------------------------------------------------------------------
  */

  const summary =
    analysis.summary ||
    `Your resume received an overall score of ${score}/100 and an ATS score of ${atsScore}/100.`;

  /*
  |--------------------------------------------------------------------------
  | COMBINE AI INFORMATION
  |--------------------------------------------------------------------------
  */

  const finalSuggestions = [
    ...suggestions,

    technicalSkills.length > 0
      ? `Detected technical skills: ${technicalSkills.join(", ")}.`
      : null,

    missingSkills.length > 0
      ? `Consider adding or developing these relevant skills: ${missingSkills.join(", ")}.`
      : null,

    recommendedRoles.length > 0
      ? `Recommended roles based on your resume: ${recommendedRoles.join(", ")}.`
      : null,

    analysis.experienceFeedback
      ? `Experience feedback: ${analysis.experienceFeedback}`
      : null,

    analysis.projectFeedback
      ? `Project feedback: ${analysis.projectFeedback}`
      : null,

    analysis.educationFeedback
      ? `Education feedback: ${analysis.educationFeedback}`
      : null,

    `ATS Score: ${atsScore}/100.`,

    softSkills.length > 0
      ? `Detected soft skills: ${softSkills.join(", ")}.`
      : null,
  ].filter(Boolean);

  /*
  |--------------------------------------------------------------------------
  | RETURN ANALYSIS
  |--------------------------------------------------------------------------
  */

  return {
    score,

    summary,

    strengths,

    gaps,

    suggestions:
      finalSuggestions.length > 0
        ? finalSuggestions
        : [
            "Add measurable achievements.",
            "Improve project descriptions.",
            "Use stronger action verbs.",
          ],
  };
};

/*
|--------------------------------------------------------------------------
| UPLOAD RESUME
|--------------------------------------------------------------------------
*/

export const uploadResume = async (
  request,
  response,
) => {
  let filePath;

  try {
    /*
    |--------------------------------------------------------------------------
    | CHECK FILE
    |--------------------------------------------------------------------------
    */

    if (!request.file) {
      return response.status(400).json({
        success: false,
        message:
          "Please upload a PDF resume.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK PDF
    |--------------------------------------------------------------------------
    */

    const isPdf =
      request.file.mimetype ===
        "application/pdf" ||
      path
        .extname(request.file.originalname)
        .toLowerCase() === ".pdf";

    if (!isPdf) {
      return response.status(400).json({
        success: false,
        message:
          "Only PDF resumes are supported.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FILE PATH
    |--------------------------------------------------------------------------
    */

    filePath = request.file.path;

    /*
    |--------------------------------------------------------------------------
    | EXTRACT TEXT
    |--------------------------------------------------------------------------
    */

    console.log(
      "Extracting text from resume...",
    );

    const rawText =
      await parseResumeText(filePath);

    if (!rawText) {
      return response.status(422).json({
        success: false,
        message:
          "This PDF does not contain readable text. Please upload a text-based resume PDF.",
      });
    }

    console.log(
      "Resume text extracted successfully.",
    );

    /*
    |--------------------------------------------------------------------------
    | AI ANALYSIS
    |--------------------------------------------------------------------------
    */

    console.log(
      "Sending resume to Gemini for analysis...",
    );

    const analysis =
      await analyzeResumeWithAI(
        rawText,
      );

    console.log(
      "AI resume analysis completed.",
    );

    /*
    |--------------------------------------------------------------------------
    | SAVE TO MONGODB
    |--------------------------------------------------------------------------
    */

    const saved =
      await ResumeAnalysis.findOneAndUpdate(
        {
          user: request.user._id,
        },

        {
          $set: {
            user:
              request.user._id,

            fileName:
              request.file.originalname,

            score:
              analysis.score,

            summary:
              analysis.summary,

            strengths:
              analysis.strengths,

            gaps:
              analysis.gaps,

            suggestions:
              analysis.suggestions,

            rawText:
              rawText,
          },
        },

        {
          returnDocument: "after",
          upsert: true,
          runValidators: true,
        },
      );

    /*
    |--------------------------------------------------------------------------
    | SEND RESPONSE
    |--------------------------------------------------------------------------
    */

    return response.status(200).json({
      success: true,

      message:
        "Resume analyzed successfully.",

      data: {
        id:
          saved._id,

        fileName:
          saved.fileName,

        score:
          saved.score,

        summary:
          saved.summary,

        strengths:
          saved.strengths,

        gaps:
          saved.gaps,

        suggestions:
          saved.suggestions,
      },
    });

  } catch (error) {

    /*
    |--------------------------------------------------------------------------
    | ERROR LOGGING
    |--------------------------------------------------------------------------
    */

    console.error(
      "Resume analysis error:",
      error.message,
    );

    /*
    |--------------------------------------------------------------------------
    | SAFE AI ERROR LOGGING
    |--------------------------------------------------------------------------
    |
    | Do NOT print request headers because they may contain API keys.
    |
    */

    if (error.response?.data) {
      console.error(
        "Gemini API error:",
        JSON.stringify(
          error.response.data,
          null,
          2,
        ),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FRIENDLY ERROR MESSAGE
    |--------------------------------------------------------------------------
    */

    let message =
      "Unable to analyze resume.";

    const status =
      error.response?.status;

    if (status === 429) {
      message =
        "Gemini API rate limit reached. Please try again after a few seconds.";
    }

    if (status === 503) {
      message =
        "Gemini AI is temporarily unavailable (high demand on all available models). Please try again in a moment.";
    }

    if (status === 400) {
      message =
        "Gemini rejected the request. Please check your Gemini model and API key.";
    }

    if (status === 401 || status === 403) {
      message =
        "Gemini API key is invalid or does not have permission to use this API.";
    }

    if (status === 404) {
      message =
        "The configured Gemini model was not found or is no longer available. Please update GEMINI_MODEL in your .env file.";
    }

    const clientMessage = error.message?.includes("GEMINI_API_KEY")
      ? "Resume analysis is not configured. Please ask the administrator to configure the Gemini API key."
      : error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
        ? "Resume analysis timed out. Please try again in a moment."
      : message;
    const responseStatus = status === 429
      ? 429
      : error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
        ? 504
        : status
          ? 502
          : 500;

    return response.status(responseStatus).json({
      success: false,

      message: clientMessage,

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });

  } finally {

    /*
    |--------------------------------------------------------------------------
    | DELETE TEMPORARY PDF
    |--------------------------------------------------------------------------
    */

    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      try {
        fs.unlinkSync(filePath);

        console.log(
          "Temporary resume file deleted.",
        );

      } catch (deleteError) {

        console.error(
          "Unable to delete uploaded file:",
          deleteError.message,
        );
      }
    }
  }
};

/*
|--------------------------------------------------------------------------
| GET RESUME ANALYSIS
|--------------------------------------------------------------------------
*/

export const getResumeAnalysis = async (
  request,
  response,
) => {

  try {

    const result =
      await ResumeAnalysis.findOne({
        user:
          request.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    /*
    |--------------------------------------------------------------------------
    | NO ANALYSIS FOUND
    |--------------------------------------------------------------------------
    */

    if (!result) {
      return response.status(200).json({
        success: true,
        data: null,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN ANALYSIS
    |--------------------------------------------------------------------------
    */

    return response.status(200).json({
      success: true,

      data: {
        id:
          result._id,

        fileName:
          result.fileName,

        score:
          result.score,

        summary:
          result.summary,

        strengths:
          result.strengths,

        gaps:
          result.gaps,

        suggestions:
          result.suggestions,
      },
    });

  } catch (error) {

    console.error(
      "Get resume analysis error:",
      error.message,
    );

    return response.status(500).json({
      success: false,

      message:
        "Unable to fetch resume analysis.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};