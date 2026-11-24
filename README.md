# AI CareerOS 🚀

AI CareerOS is an AI-powered career guidance platform built with the **MERN stack**. It helps students analyze their resumes, find suitable career paths, identify skill gaps, and prepare for jobs and interviews.

## ✨ Features

* 🔐 JWT-based Authentication
* 📄 AI Resume Analyzer
* 🎯 AI Career Recommendations
* 📊 Skill Gap Analysis
* 🗺️ Personalized Learning Roadmap
* 💼 AI Job Matching
* 🎤 AI Interview Preparation
* 🤖 AI Career Assistant
* 📈 Career Progress Dashboard
* 🧑‍💼 Recruiter job management and application review
* 🔖 Candidate job saving and application tracking

## 🛠️ Tech Stack

**Frontend:** React.js, Vite, Tailwind CSS, Axios
**Backend:** Node.js, Express.js, JWT, bcrypt
**Database:** MongoDB, Mongoose
**AI:** LLM API

## ⚙️ Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/ai-careeros.git

# Frontend
cd client
npm install
npm run dev

# Backend
cd ../server
npm install
npm run dev
```

Create a `.env` file in the `server` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AI_API_KEY=your_ai_api_key
AI_API_URL=your_ai_api_url
```

The API reads `MONGODB_URI` from the server or repository root `.env` file. Recruiter accounts require a company name and are not independently verified. Recruiters can manage their own postings and review applications; candidates can save jobs and submit one application per listing.

To add the labeled demonstration listings to the configured MongoDB database, run:

```bash
npm run seed:jobs --prefix server
```

These records are explicitly marked as samples and are not verified vacancies.

## 📂 Project Structure

```text
AI-CareerOS/
├── client/     # React frontend
├── server/     # Node.js + Express backend
├── README.md
└── .gitignore
```

## 🎯 Goal

To provide students with a single AI-powered platform for **career planning, resume improvement, skill development, job matching, and interview preparation**.

## 👨‍💻 Author

**Akash Rajshekhar**
B.Tech IT Student
