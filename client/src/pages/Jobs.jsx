import { useEffect, useState } from 'react'
import { Bookmark, BriefcaseBusiness, Check, MapPin, Search, Send, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Jobs() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { token, user } = useAuth()
    const [jobs, setJobs] = useState([])
    const [matches, setMatches] = useState({})
    const [matchingJob, setMatchingJob] = useState('')
    const [search, setSearch] = useState(() => searchParams.get('search') || '')
    const [mode, setMode] = useState('All')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [savedIds, setSavedIds] = useState({})
    const [appliedIds, setAppliedIds] = useState({})
    const [applyingJob, setApplyingJob] = useState('')
    const [resumeUrl, setResumeUrl] = useState('')
    const [coverLetter, setCoverLetter] = useState('')
    const [actionLoading, setActionLoading] = useState('')

    useEffect(() => {
        const loadJobs = async () => {
            setLoading(true)
            setError('')

            try {
                const token = localStorage.getItem('careeros-token')
                const params = { search }
                if (mode !== 'All') params.mode = mode

                const response = await axios.get(`${API_URL}/jobs`, {
                    params,
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                setJobs(response.data.data.jobs)
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load opportunities.')
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(loadJobs, 250)
        return () => clearTimeout(timer)
    }, [search, mode])

    useEffect(() => {
        if (!token || user?.role !== 'student') return
        const loadActivity = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` }
                const [savedResponse, applicationResponse] = await Promise.all([
                    axios.get(`${API_URL}/jobs/saved`, { headers }),
                    axios.get(`${API_URL}/jobs/applications`, { headers }),
                ])
                setSavedIds(Object.fromEntries(savedResponse.data.data.jobs.map((job) => [job.id, true])))
                setAppliedIds(Object.fromEntries(applicationResponse.data.data.applications.map((application) => [application.job?._id, true])))
            } catch (activityError) {
                setError(activityError.response?.data?.message || 'Unable to load your saved job activity.')
            }
        }
        loadActivity()
    }, [token, user?.role])

    const loadMatch = async (jobId) => {
        if (!token) {
            navigate('/login', { state: { from: `/jobs?search=${encodeURIComponent(search)}` } })
            return
        }
        setMatchingJob(jobId)
        setError('')
        try {
            const token = localStorage.getItem('careeros-token')
            const response = await axios.get(`${API_URL}/jobs/${jobId}/match`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setMatches((current) => ({ ...current, [jobId]: response.data.data.match }))
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to calculate this job match.')
        } finally {
            setMatchingJob('')
        }
    }

    const toggleSaved = async (jobId) => {
        if (!token) {
            navigate('/login', { state: { from: `/jobs?search=${encodeURIComponent(search)}` } })
            return
        }
        if (user?.role !== 'student') {
            setError('Only candidate accounts can save jobs.')
            return
        }
        setActionLoading(jobId)
        setError('')
        try {
            if (savedIds[jobId]) {
                await axios.delete(`${API_URL}/jobs/${jobId}/save`, { headers: { Authorization: `Bearer ${token}` } })
                setSavedIds((current) => ({ ...current, [jobId]: false }))
            } else {
                await axios.put(`${API_URL}/jobs/${jobId}/save`, {}, { headers: { Authorization: `Bearer ${token}` } })
                setSavedIds((current) => ({ ...current, [jobId]: true }))
            }
        } catch (actionError) {
            setError(actionError.response?.data?.message || 'Unable to update saved jobs.')
        } finally {
            setActionLoading('')
        }
    }

    const startApplication = (jobId) => {
        if (!token) {
            navigate('/login', { state: { from: `/jobs?search=${encodeURIComponent(search)}` } })
            return
        }
        if (user?.role !== 'student') {
            setError('Only candidate accounts can apply for jobs.')
            return
        }
        if (appliedIds[jobId]) return
        setApplyingJob(jobId)
        setResumeUrl('')
        setCoverLetter('')
        setError('')
    }

    const submitApplication = async (event, jobId) => {
        event.preventDefault()
        setActionLoading(jobId)
        setError('')
        try {
            await axios.post(`${API_URL}/jobs/${jobId}/apply`, { resumeUrl, coverLetter }, { headers: { Authorization: `Bearer ${token}` } })
            setAppliedIds((current) => ({ ...current, [jobId]: true }))
            setApplyingJob('')
        } catch (actionError) {
            if (actionError.response?.status === 409) {
                setAppliedIds((current) => ({ ...current, [jobId]: true }))
                setApplyingJob('')
            }
            setError(actionError.response?.data?.message || 'Unable to submit your application.')
        } finally {
            setActionLoading('')
        }
    }

    return (
            <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Career opportunities</p>
                        <h1 className="mt-2 text-3xl font-semibold">Find your next opportunity</h1>
                        <p className="mt-2 text-slate-400">Explore {jobs.length || 'open'} roles aligned with the career direction you are building.</p>
                    </div>
                    <button type="button" onClick={() => navigate('/dashboard')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
                        Back to dashboard
                    </button>
                </div>

                <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
                    <p className="text-sm font-medium text-slate-300">Popular roles</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {['Frontend Developer', 'Backend Developer', 'MERN Stack Developer', 'React Developer', 'Java Developer', 'Python Developer', 'Data Analyst', 'Data Scientist', 'UI/UX Designer', 'DevOps Engineer', 'Android Developer', 'Machine Learning Engineer', 'Full Stack Developer', 'Software Development Intern'].map((role) => (
                            <button key={role} type="button" onClick={() => setSearch(role)} className="rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200">{role}</button>
                        ))}
                    </div>
                </div>

                <div className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-slate-900 p-4 md:grid-cols-[1fr_auto]">
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                        <Search size={18} className="text-slate-500" />
                        <input aria-label="Search jobs" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search role, company, or skill" className="w-full bg-transparent text-white outline-none placeholder:text-slate-600" />
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['All', 'Remote', 'Hybrid', 'On-site'].map((option) => (
                            <button key={option} type="button" onClick={() => setMode(option)} className={`rounded-xl px-3 py-2 text-sm transition ${mode === option ? 'bg-cyan-400 font-semibold text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {user?.role === 'student' && <div className="mb-5 flex justify-end"><Link to="/applications" className="text-sm font-medium text-cyan-700 hover:text-cyan-900">View applications and saved jobs</Link></div>}

                {error && <ErrorState message={error} />}
                {loading && <LoadingState message="Loading opportunities..." />}
                {!loading && !error && jobs.length === 0 && <EmptyState title="No matching roles" message="Try a different search term or work-mode filter." />}

                {!loading && !error && jobs.length > 0 && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {jobs.map((job) => (
                            <article key={job.id} className="rounded-2xl border border-white/10 bg-slate-900 p-6 transition hover:border-cyan-400/40">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xl font-semibold text-white">{job.title}</p>
                                        <p className="mt-1 text-slate-400">{job.company}</p>
                                    </div>
                                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">{job.type}</span>
                                </div>
                                {job.isSample && <p className="mt-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-800">Sample listing - not a verified vacancy</p>}
                                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
                                    <span className="flex items-center gap-2"><MapPin size={15} className="text-cyan-300" />{job.location}</span>
                                    <span className="flex items-center gap-2"><BriefcaseBusiness size={15} className="text-cyan-300" />{job.mode}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                                    {job.salary && <span>{job.salary}</span>}
                                    {job.experience && <span>{job.experience}</span>}
                                    {job.createdAt && <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>}
                                </div>
                                <p className="mt-5 leading-7 text-slate-300">{job.description}</p>
                                <div className="mt-5 flex flex-wrap gap-2">{(job.skills || []).map((skill) => <span key={skill} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{skill}</span>)}</div>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {user?.role !== 'recruiter' && user?.role !== 'admin' && <button type="button" onClick={() => loadMatch(job.id)} disabled={matchingJob === job.id} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-70">
                                        <Sparkles size={16} />{matchingJob === job.id ? 'Calculating...' : matches[job.id] ? 'Refresh match' : 'Check my match'}
                                    </button>}
                                    {user?.role !== 'recruiter' && user?.role !== 'admin' && <button type="button" onClick={() => toggleSaved(job.id)} disabled={actionLoading === job.id} aria-pressed={Boolean(savedIds[job.id])} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60">
                                        <Bookmark size={16} />{savedIds[job.id] ? 'Saved' : 'Save job'}
                                    </button>}
                                    {user?.role !== 'recruiter' && user?.role !== 'admin' && <button type="button" onClick={() => startApplication(job.id)} disabled={Boolean(appliedIds[job.id])} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60">
                                        <Send size={16} />{appliedIds[job.id] ? 'Applied' : 'Apply'}
                                    </button>}
                                </div>
                                {applyingJob === job.id && <form onSubmit={(event) => submitApplication(event, job.id)} className="mt-4 space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                                    <h3 className="font-semibold text-slate-800">Apply to {job.title}</h3>
                                    <label className="block text-sm text-slate-600">Resume URL (optional)<input type="url" value={resumeUrl} onChange={(event) => setResumeUrl(event.target.value)} placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500" /></label>
                                    <label className="block text-sm text-slate-600">Cover note (optional)<textarea value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} maxLength={5000} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500" /></label>
                                    <div className="flex gap-2"><button type="submit" disabled={actionLoading === job.id} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{actionLoading === job.id ? 'Submitting...' : 'Submit application'}</button><button type="button" onClick={() => setApplyingJob('')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">Cancel</button></div>
                                </form>}
                                {matches[job.id] && <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                                    <div className="flex items-center justify-between"><p className="font-semibold text-cyan-100">Your match</p><p className="text-2xl font-semibold text-cyan-200">{matches[job.id].score}%</p></div>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">{matches[job.id].explanation}</p>
                                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-2"><div><p className="mb-2 text-emerald-300">Matching skills</p>{matches[job.id].matchingSkills.map((skill) => <p key={skill} className="flex items-center gap-2 text-slate-200"><Check size={14} className="text-emerald-300" />{skill}</p>)}</div><div><p className="mb-2 text-amber-300">Skills to improve</p>{matches[job.id].missingSkills.map((skill) => <p key={skill} className="text-slate-300">{skill}</p>)}</div></div>
                                    <p className="mt-3 text-sm text-slate-400">{matches[job.id].recommendation}</p>
                                </div>}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
