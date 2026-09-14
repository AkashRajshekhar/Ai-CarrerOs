import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Assessment from './pages/Assessment'
import Recommendation from './pages/Recommendation'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import InterviewPrep from './pages/InterviewPrep'
import Assistant from './pages/Assistant'
import Jobs from './pages/Jobs'
import SkillGap from './pages/SkillGap'
import Roadmap from './pages/Roadmap'
import SettingsPage from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import axios from 'axios'

function LandingPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <span className="rounded-lg bg-cyan-400 p-2 text-slate-950"><BrainCircuit size={18} /></span>
                    AI CareerOS
                </Link>
                <div className="flex items-center gap-3 text-sm">
                    <Link to="/login" className="rounded-full px-4 py-2 text-slate-300 hover:text-white">Log in</Link>
                    <Link to="/signup" className="rounded-full bg-white px-4 py-2 font-medium text-slate-950 hover:bg-cyan-100">Get started</Link>
                </div>
            </nav>
            <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-28">
                <div>
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm text-cyan-200">
                        <Sparkles size={15} /> Built for your next chapter
                    </div>
                    <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Your AI-powered career operating system.</h1>
                    <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Turn your skills, ambitions, and preparation into a clear path from college to the career you want.</p>
                    <Link to="/signup" className="mt-9 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Start building your edge <ArrowRight size={18} /></Link>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
                    <div className="rounded-2xl bg-slate-900 p-6">
                        <p className="text-sm text-slate-400">Career readiness</p>
                        <div className="mt-3 flex items-end justify-between"><p className="text-5xl font-semibold">78<span className="text-2xl text-cyan-300">%</span></p><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">+12% this month</span></div>
                        <div className="mt-6 h-2 rounded-full bg-slate-800"><div className="h-2 w-[78%] rounded-full bg-cyan-400" /></div>
                        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"><Metric label="Resume score" value="82" /><Metric label="Top career" value="Full Stack" /><Metric label="Skill gaps" value="4" /></div>
                    </div>
                </div>
            </section>
        </main>
    )
}

function Metric({ label, value }) {
    return <div className="rounded-xl border border-white/10 bg-white/4 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-medium text-slate-100">{value}</p></div>
}

function Placeholder({ title }) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white"><div><p className="text-sm uppercase tracking-[0.25em] text-cyan-300">AI CareerOS</p><h1 className="mt-4 text-4xl font-semibold">{title}</h1><p className="mt-3 text-slate-400">This Phase 1 route is ready for the next feature slice.</p><Link to="/" className="mt-6 inline-block text-cyan-300 hover:text-cyan-200">Back to home</Link></div></main>
}

const readinessTrend = [
    { month: 'Jan', score: 52 },
    { month: 'Feb', score: 58 },
    { month: 'Mar', score: 63 },
    { month: 'Apr', score: 70 },
    { month: 'May', score: 76 },
    { month: 'Jun', score: 82 },
]

const skillGapData = [
    { skill: 'TypeScript', value: 68 },
    { skill: 'Docker', value: 46 },
    { skill: 'AWS', value: 38 },
    { skill: 'Testing', value: 55 },
    { skill: 'System Design', value: 42 },
]

const recommendedJobs = [
    { title: 'Frontend Developer', match: 91 },
    { title: 'Full Stack Developer', match: 87 },
    { title: 'React Developer', match: 84 },
    { title: 'Software Engineer', match: 80 },
]

const recentActivity = [
    { label: 'Resume analyzed', detail: 'Updated resume score to 82', time: '2h ago' },
    { label: 'Career assessment', detail: 'Full Stack Developer shortlisted', time: '1d ago' },
    { label: 'Roadmap progress', detail: 'Completed Week 2 tasks', time: '2d ago' },
    { label: 'Interview prep', detail: 'Practice session scored 8.4/10', time: '4d ago' },
]

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'My Profile', icon: UserCircle2 },
    { label: 'Career Assessment', icon: Target },
    { label: 'Resume Analyzer', icon: FileText },
    { label: 'Career Paths', icon: BrainCircuit },
    { label: 'Skill Gap', icon: BarChart3 },
    { label: 'Roadmap', icon: RouteIcon },
    { label: 'Jobs', icon: Briefcase },
    { label: 'Interview Prep', icon: CheckCheck },
    { label: 'AI Assistant', icon: MessageSquareText },
    { label: 'Settings', icon: Settings },
]

function DashboardPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const [summary, setSummary] = useState(null)
    const [dashboardError, setDashboardError] = useState('')

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const token = localStorage.getItem('careeros-token')
                const response = await axios.get('http://localhost:5000/api/dashboard/summary', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setSummary(response.data.data)
            } catch (error) {
                setDashboardError(error.response?.data?.message || 'Unable to load your live dashboard data.')
            }
        }
        loadDashboard()
    }, [])

    const dashboardCards = summary?.cards || { resumeScore: 0, careerMatch: 'Not assessed', skillGap: 0, roadmapProgress: 0 }
    const liveChart = summary?.chart?.map((item) => ({ month: item.label, score: item.value })) || []
    const liveJobs = summary?.recommendedJobs || []

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
                <button type="button" onClick={() => setMobileNavOpen((current) => !current)} aria-label="Toggle navigation" className="fixed right-4 top-4 z-30 rounded-xl border border-white/10 bg-slate-900 p-3 text-slate-200 shadow-lg lg:hidden">
                    {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
                </button>
                <aside className={`${mobileNavOpen ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-20 w-[min(86vw,18rem)] overflow-y-auto border-r border-white/10 bg-slate-900 p-5 shadow-2xl lg:static lg:block lg:w-72 lg:shrink-0 lg:border-b-0 lg:shadow-none`}>
                    <div className="flex items-center gap-3 px-2 pb-6">
                        <div className="rounded-xl bg-cyan-400 p-2 text-slate-950">
                            <BrainCircuit size={18} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI CareerOS</p>
                            <h2 className="text-lg font-semibold">CareerOS</h2>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[...navItems, ...(user?.role === 'admin' ? [{ label: 'Admin Dashboard', icon: ShieldCheck }] : [])].map(({ label, icon: Icon }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => {
                                    if (label === 'Career Assessment') {
                                        navigate('/assessment')
                                    }
                                    if (label === 'My Profile') {
                                        navigate('/profile')
                                    }
                                    if (label === 'Career Paths') {
                                        navigate('/recommendation')
                                    }
                                    if (label === 'Resume Analyzer') {
                                        navigate('/resume-analyzer')
                                    }
                                    if (label === 'Interview Prep') {
                                        navigate('/interview-prep')
                                    }
                                    if (label === 'AI Assistant') {
                                        navigate('/assistant')
                                    }
                                    if (label === 'Jobs') {
                                        navigate('/jobs')
                                    }
                                    if (label === 'Skill Gap') {
                                        navigate('/skill-gap')
                                    }
                                    if (label === 'Roadmap') {
                                        navigate('/roadmap')
                                    }
                                    if (label === 'Settings') {
                                        navigate('/settings')
                                    }
                                    if (label === 'Admin Dashboard') {
                                        navigate('/admin')
                                    }
                                    if (window.innerWidth < 1024) setMobileNavOpen(false)
                                }}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${label === 'Dashboard'
                                    ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/20'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
                            <h1 className="mt-1 text-3xl font-semibold text-white">{user?.name || 'Student'} 👋</h1>
                        </div>
                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
                            Career readiness: {summary ? `${summary.readiness}%` : 'Loading...'}
                        </div>
                    </header>

                    {dashboardError && <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{dashboardError}</div>}

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <button type="button" onClick={() => navigate('/resume-analyzer')} className="text-left"><Card title="Resume Score" value={summary ? `${dashboardCards.resumeScore}/100` : 'Loading...'} accent="cyan" /></button>
                        <button type="button" onClick={() => navigate('/recommendation')} className="text-left"><Card title="Career Match" value={dashboardCards.careerMatch} accent="violet" /></button>
                        <button type="button" onClick={() => navigate('/skill-gap')} className="text-left"><Card title="Priority Gaps" value={summary ? `${dashboardCards.skillGap} skills` : 'Loading...'} accent="amber" /></button>
                        <button type="button" onClick={() => navigate('/roadmap')} className="text-left"><Card title="Roadmap" value={summary ? `${dashboardCards.roadmapProgress}% complete` : 'Loading...'} accent="green" /></button>
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
                                    <AreaChart data={liveChart.length ? liveChart : readinessTrend}>
                                        <defs>
                                            <linearGradient id="readinessFill" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.08} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="month" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" domain={[0, 100]} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="score" stroke="#22d3ee" fill="url(#readinessFill)" strokeWidth={3} />
                                    </AreaChart>
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
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={liveChart.length ? liveChart.map((item) => ({ skill: item.month, value: item.score })) : skillGapData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
                                        <YAxis type="category" dataKey="skill" stroke="#94a3b8" width={90} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#a78bfa" />
                                    </BarChart>
                                </ResponsiveContainer>
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
                                {liveJobs.length ? liveJobs.map((job) => (
                                    <div key={job} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                                        <div>
                                            <p className="font-medium text-white">{job}</p>
                                            <p className="text-sm text-slate-400">Tech Company • Remote</p>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-slate-400">Complete your assessment to see career-aligned opportunities.</p>}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Recent activity</p>
                                    <h3 className="text-xl font-semibold">Your progress</h3>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {(summary ? [
                                    { label: 'Profile', detail: summary.profileComplete ? 'Profile completed' : 'Complete your profile', time: '' },
                                    { label: 'Assessment', detail: summary.hasAssessment ? 'Career assessment available' : 'Take the career assessment', time: '' },
                                    { label: 'Resume', detail: summary.hasResume ? 'Resume analysis available' : 'Upload your resume', time: '' },
                                    { label: 'Roadmap', detail: summary.hasRoadmap ? `${dashboardCards.roadmapProgress}% complete` : 'Generate your roadmap', time: '' },
                                ] : recentActivity).map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-medium text-white">{item.label}</p>
                                            <span className="text-xs text-slate-400">{item.time}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

function Card({ title, value, accent }) {
    const accentMap = {
        cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200',
        violet: 'border-violet-400/30 bg-violet-500/10 text-violet-200',
        amber: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
        green: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
    }

    return (
        <div className={`rounded-2xl border p-5 ${accentMap[accent]}`}>
            <p className="text-sm text-slate-300">{title}</p>
            <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
        </div>
    )
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
                    element={
                        <ProtectedRoute>
                            <Jobs />
                        </ProtectedRoute>
                    }
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
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    )
}
