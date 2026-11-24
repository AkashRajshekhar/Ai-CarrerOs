import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  BrainCircuit,
  CheckCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Route as RouteIcon,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserCircle2,
  Menu,
  X,
  ShieldCheck,
  MapPin,
  Search,
  Bookmark,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Assessment from "./pages/Assessment";
import Recommendation from "./pages/Recommendation";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import InterviewPrep from "./pages/InterviewPrep";
import Assistant from "./pages/Assistant";
import Jobs from "./pages/Jobs";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";
import SettingsPage from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import Applications from "./pages/Applications";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function LandingPage() {
  const navigate = useNavigate();
  const [jobSearch, setJobSearch] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [jobCount, setJobCount] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/jobs`)
      .then((response) => {
        const jobs = response.data?.data?.jobs || [];
        setFeaturedJobs(jobs.slice(0, 3));
        setJobCount(response.data?.data?.total || jobs.length);
      })
      .catch(() => {
        setFeaturedJobs([]);
        setJobCount(null);
      });
  }, []);

  const searchJobs = (event) => {
    event.preventDefault();
    const query = jobSearch.trim();
    navigate(query ? `/jobs?search=${encodeURIComponent(query)}` : "/jobs");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg"
        >
          <span className="rounded-lg bg-cyan-400 p-2 text-slate-950">
            <BrainCircuit size={18} />
          </span>
          AI CareerOS
        </Link>
        <div className="flex shrink-0 items-center gap-1 text-sm sm:gap-3">
          <a href="#featured-jobs" className="hidden px-3 py-2 text-slate-300 hover:text-white sm:inline-flex">
            Explore jobs
          </a>
          <a href="#features" className="hidden px-3 py-2 text-slate-300 hover:text-white sm:inline-flex">
            Platform
          </a>
          <Link
            to="/login"
            className="hidden whitespace-nowrap rounded-full px-2 py-2 text-slate-300 hover:text-white sm:inline-flex sm:px-4"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="whitespace-nowrap rounded-full bg-cyan-400 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-cyan-300 sm:px-4 sm:text-sm"
          >
            Get started
          </Link>
        </div>
      </nav>
      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm text-cyan-200">
            <Sparkles size={15} /> Built for your next chapter
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Your AI-powered career operating system.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Turn your skills, ambitions, and preparation into a clear path from
            college to the career you want.
          </p>
          <form onSubmit={searchJobs} className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2">
              <Search size={18} className="shrink-0 text-slate-500" />
              <input
                value={jobSearch}
                onChange={(event) => setJobSearch(event.target.value)}
                placeholder="Search roles, companies, or skills"
                aria-label="Search jobs"
                className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none placeholder:text-slate-500"
              />
            </label>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Find jobs <ArrowRight size={17} />
            </button>
          </form>
          <Link
            to="/signup"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Start building your edge <ArrowRight size={18} />
          </Link>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur lg:scale-105">
          <div className="rounded-2xl bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Your career workspace</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">A clearer next step</h2>
            <div className="mt-6 space-y-3">
              <Metric label="Career direction" value="Personalized recommendations" />
              <Metric label="Skill development" value="Focused learning roadmap" />
              <Metric label="Job readiness" value="Resume and interview practice" />
            </div>
          </div>
        </div>
      </section>
      <section id="featured-jobs" className="border-y border-white/10 bg-slate-900/70 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Featured opportunities</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Roles to explore next</h2>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
              Browse {jobCount || "all"} opportunities <ArrowRight size={16} />
            </Link>
          </div>
          {featuredJobs.length ? (
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {featuredJobs.map((job) => (
                <Link key={job.id} to={`/jobs?search=${encodeURIComponent(job.title)}`} className="rounded-2xl border border-white/10 bg-slate-950 p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{job.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{job.company}</p>
                    </div>
                    <Briefcase size={18} className="shrink-0 text-cyan-300" />
                  </div>
                  <p className="mt-5 flex items-center gap-2 text-sm text-slate-300"><MapPin size={15} />{job.location}</p>
                  <p className="mt-2 text-sm text-slate-400">{job.salary || job.type}</p>
                  {job.isSample && <span className="mt-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-800">Sample listing</span>}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-400">New opportunities will appear here when listings are available.</p>
          )}
        </div>
      </section>
      <section id="features" className="border-y border-white/10 bg-slate-900/70 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Everything in one place
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Build momentum from your first skill to your next offer.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={Target}
              title="Find your direction"
              text="Turn your interests and strengths into career paths worth exploring."
            />
            <Feature
              icon={FileText}
              title="Strengthen your resume"
              text="Get practical feedback that makes your experience easier to notice."
            />
            <Feature
              icon={RouteIcon}
              title="Follow a clear roadmap"
              text="Work through focused skills, projects, and weekly milestones."
            />
            <Feature
              icon={CheckCheck}
              title="Practice with purpose"
              text="Prepare for real interviews with role-specific questions and feedback."
            />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-7 sm:grid-cols-3">
            <div><p className="text-2xl font-semibold text-white">6</p><p className="mt-1 text-sm text-slate-400">Career preparation tools</p></div>
            <div><p className="text-2xl font-semibold text-white">{jobCount ?? "-"}</p><p className="mt-1 text-sm text-slate-400">Available job listings</p></div>
            <div><p className="text-2xl font-semibold text-white">4</p><p className="mt-1 text-sm text-slate-400">Core workflow tools</p></div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Explore your options
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              A better starting point for every kind of builder.
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              Whether you want to ship interfaces, train models, or make systems
              reliable, CareerOS helps you see the next useful step.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Frontend Developer",
              "Backend Developer",
              "Full Stack Developer",
              "Data Analyst",
              "AI / ML Engineer",
              "Cloud Engineer",
              "UX Designer",
              "Cybersecurity Analyst",
            ].map((role) => (
              <Link
                key={role}
                to={`/jobs?search=${encodeURIComponent(role)}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
              >
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                {role}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-cyan-400 px-6 py-16 text-slate-950 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-800">
              Your next move starts here
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Make your career plan feel achievable.
            </h2>
          </div>
          <Link
            to="/signup"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Create your plan <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <footer className="border-t border-white/10 bg-slate-950 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="font-semibold text-white">AI CareerOS</Link>
          <p>Career planning, preparation, and opportunities in one workspace.</p>
          <div className="flex gap-5"><Link to="/login" className="hover:text-white">Log in</Link><Link to="/signup" className="hover:text-white">Create account</Link></div>
        </div>
      </footer>
    </main>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <Icon size={22} className="text-cyan-300" />
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/4 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-100">{value}</p>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          AI CareerOS
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{title}</h1>
        <p className="mt-3 text-slate-400">
          This route is ready for the next feature slice.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-cyan-300 hover:text-cyan-200"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

const recommendedJobs = [
  { title: "Frontend Developer", match: 91 },
  { title: "Full Stack Developer", match: 87 },
  { title: "React Developer", match: 84 },
  { title: "Software Engineer", match: 80 },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Profile", icon: UserCircle2 },
  { label: "Career Assessment", icon: Target },
  { label: "Resume Analyzer", icon: FileText },
  { label: "Career Paths", icon: BrainCircuit },
  { label: "Skill Gap", icon: BarChart3 },
  { label: "Roadmap", icon: RouteIcon },
  { label: "Jobs", icon: Briefcase },
  { label: "Interview Prep", icon: CheckCheck },
  { label: "AI Assistant", icon: MessageSquareText },
  { label: "Settings", icon: Settings },
];

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("careeros-token");
        const response = await axios.get(
          `${API_URL}/dashboard/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSummary(response.data.data);
      } catch (error) {
        setDashboardError(
          error.response?.data?.message ||
            "Unable to load your live dashboard data.",
        );
      }
    };
    loadDashboard();
  }, []);

  const dashboardCards = summary?.cards || {
    resumeScore: 0,
    careerMatch: "Not assessed",
    skillGap: 0,
    roadmapProgress: 0,
  };
  const liveChart =
    summary?.chart?.map((item) => ({ month: item.label, score: item.value })) ||
    [];
  const liveJobs = summary?.recommendedJobs || [];
  const liveSkillGaps = summary?.skillGapSkills || [];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <button
          type="button"
          onClick={() => setMobileNavOpen((current) => !current)}
          aria-label="Toggle navigation"
          className="fixed right-4 top-4 z-30 rounded-xl border border-white/10 bg-slate-900 p-3 text-slate-200 shadow-lg lg:hidden"
        >
          {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <aside
          className={`${mobileNavOpen ? "block" : "hidden"} fixed inset-y-0 left-0 z-20 w-[min(86vw,18rem)] overflow-y-auto border-r border-white/10 bg-slate-900 p-5 shadow-2xl lg:static lg:block lg:w-72 lg:shrink-0 lg:border-b-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-3 px-2 pb-6">
            <div className="rounded-xl bg-cyan-400 p-2 text-slate-950">
              <BrainCircuit size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                AI CareerOS
              </p>
              <h2 className="text-lg font-semibold">CareerOS</h2>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              ...navItems,
              ...(user?.role === "student"
                ? [{ label: "Applications & Saved Jobs", icon: Bookmark }]
                : []),
              ...(user?.role === "recruiter"
                ? [{ label: "Recruiter Dashboard", icon: Briefcase }]
                : []),
              ...(user?.role === "admin"
                ? [{ label: "Admin Dashboard", icon: ShieldCheck }]
                : []),
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (label === "Career Assessment") {
                    navigate("/assessment");
                  }
                  if (label === "My Profile") {
                    navigate("/profile");
                  }
                  if (label === "Career Paths") {
                    navigate("/recommendation");
                  }
                  if (label === "Resume Analyzer") {
                    navigate("/resume-analyzer");
                  }
                  if (label === "Interview Prep") {
                    navigate("/interview-prep");
                  }
                  if (label === "AI Assistant") {
                    navigate("/assistant");
                  }
                  if (label === "Jobs") {
                    navigate("/jobs");
                  }
                  if (label === "Applications & Saved Jobs") {
                    navigate("/applications");
                  }
                  if (label === "Recruiter Dashboard") {
                    navigate("/recruiter");
                  }
                  if (label === "Skill Gap") {
                    navigate("/skill-gap");
                  }
                  if (label === "Roadmap") {
                    navigate("/roadmap");
                  }
                  if (label === "Settings") {
                    navigate("/settings");
                  }
                  if (label === "Admin Dashboard") {
                    navigate("/admin");
                  }
                  if (window.innerWidth < 1024) setMobileNavOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  label === "Dashboard"
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                    : "text-slate-700 hover:bg-slate-100 hover:text-blue-700"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-8 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        <section className="flex-1 p-5 md:p-8">
          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-400">Good morning</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">
                {user?.name || "Student"} 👋
              </h1>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
              Career readiness:{" "}
              {summary ? `${summary.readiness}%` : "Loading..."}
            </div>
          </header>

          {dashboardError && (
            <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {dashboardError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate("/resume-analyzer")}
              className="text-left"
            >
              <Card
                title="Resume Score"
                value={
                  summary ? `${dashboardCards.resumeScore}/100` : "Loading..."
                }
                accent="cyan"
              />
            </button>
            <button
              type="button"
              onClick={() => navigate("/recommendation")}
              className="text-left"
            >
              <Card
                title="Career Match"
                value={dashboardCards.careerMatch}
                accent="violet"
              />
            </button>
            <button
              type="button"
              onClick={() => navigate("/skill-gap")}
              className="text-left"
            >
              <Card
                title="Priority Gaps"
                value={
                  summary ? `${dashboardCards.skillGap} skills` : "Loading..."
                }
                accent="amber"
              />
            </button>
            <button
              type="button"
              onClick={() => navigate("/roadmap")}
              className="text-left"
            >
              <Card
                title="Roadmap"
                value={
                  summary
                    ? `${dashboardCards.roadmapProgress}% complete`
                    : "Loading..."
                }
                accent="green"
              />
            </button>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_.9fr]">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Career readiness</p>
                  <h3 className="text-xl font-semibold">Progress overview</h3>
                </div>
                <TrendingUp className="text-cyan-300" size={20} />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {liveChart.length ? <AreaChart data={liveChart}>
                    <defs>
                      <linearGradient
                        id="readinessFill"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-primary)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-primary)"
                          stopOpacity={0.08}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-secondary)" />
                    <YAxis stroke="var(--color-secondary)" domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="var(--color-primary)"
                      fill="url(#readinessFill)"
                      strokeWidth={3}
                    />
                  </AreaChart> : <p className="flex h-full items-center justify-center text-sm text-slate-400">Complete a career activity to build your progress overview.</p>}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Skill gap</p>
                  <h3 className="text-xl font-semibold">Priority areas</h3>
                </div>
                <Target className="text-violet-300" size={20} />
              </div>
              <div className="space-y-3">
                {liveSkillGaps.length ? liveSkillGaps.slice(0, 5).map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2.5">
                    <span className="text-sm font-medium text-slate-200">{skill.name}</span>
                    <span className="text-xs text-slate-500">{skill.priority} priority · {skill.status}</span>
                  </div>
                )) : <p className="text-sm text-slate-400">Run a skill gap analysis to see your priority areas.</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Recommended jobs</p>
                  <h3 className="text-xl font-semibold">Open opportunities</h3>
                </div>
                <Briefcase className="text-emerald-300" size={20} />
              </div>
              <div className="space-y-3">
                {liveJobs.length ? (
                  liveJobs.map((job) => (
                    <Link
                      key={job}
                      to={`/jobs?search=${encodeURIComponent(job)}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-3 transition hover:border-cyan-400/40"
                    >
                      <div>
                        <p className="font-medium text-white">{job}</p>
                        <p className="text-sm text-slate-400">
                          Recommended career match
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-cyan-300" />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    Complete your assessment to see career-aligned
                    opportunities.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Progress checklist</p>
                  <h3 className="text-xl font-semibold">Your next steps</h3>
                </div>
              </div>
              <div className="space-y-4">
                {summary ? [
                      {
                        label: "Profile",
                        detail: summary.profileComplete
                          ? "Profile completed"
                          : "Complete your profile",
                        time: "",
                      },
                      {
                        label: "Assessment",
                        detail: summary.hasAssessment
                          ? "Career assessment available"
                          : "Take the career assessment",
                        time: "",
                      },
                      {
                        label: "Resume",
                        detail: summary.hasResume
                          ? "Resume analysis available"
                          : "Upload your resume",
                        time: "",
                      },
                      {
                        label: "Roadmap",
                        detail: summary.hasRoadmap
                          ? `${dashboardCards.roadmapProgress}% complete`
                          : "Generate your roadmap",
                        time: "",
                      },
                    ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{item.label}</p>
                      <span className="text-xs text-slate-400">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
                  </div>
                )) : <p className="text-sm text-slate-400">Loading your saved progress...</p>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value, accent }) {
  const accentMap = {
    cyan: "border-blue-200 bg-white text-blue-700",
    violet: "border-blue-200 bg-white text-blue-700",
    amber: "border-blue-200 bg-white text-blue-700",
    green: "border-blue-200 bg-white text-blue-700",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${accentMap[accent]}`}>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-4 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendation"
          element={
            <ProtectedRoute>
              <Recommendation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-analyzer"
          element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-prep"
          element={
            <ProtectedRoute>
              <InterviewPrep />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={<Jobs />}
        />
        <Route
          path="/skill-gap"
          element={
            <ProtectedRoute>
              <SkillGap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute roles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute roles={["student"]}>
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["student", "admin"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
