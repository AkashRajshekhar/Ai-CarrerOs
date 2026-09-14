import { useEffect, useState } from 'react'
import { BriefcaseBusiness, Check, MapPin, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Jobs() {
    const navigate = useNavigate()
    const [jobs, setJobs] = useState([])
    const [matches, setMatches] = useState({})
    const [matchingJob, setMatchingJob] = useState('')
    const [search, setSearch] = useState('')
    const [mode, setMode] = useState('All')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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
                    headers: { Authorization: `Bearer ${token}` },
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

    const loadMatch = async (jobId) => {
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

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Phase 11</p>
                        <h1 className="mt-2 text-3xl font-semibold">Find your next opportunity</h1>
                        <p className="mt-2 text-slate-400">Explore roles aligned with the career direction you are building.</p>
                    </div>
                    <button type="button" onClick={() => navigate('/dashboard')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
                        Back to dashboard
                    </button>
                </div>

                <div className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-slate-900 p-4 md:grid-cols-[1fr_auto]">
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                        <Search size={18} className="text-slate-500" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search role, company, or skill" className="w-full bg-transparent text-white outline-none placeholder:text-slate-600" />
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['All', 'Remote', 'Hybrid', 'On-site'].map((option) => (
                            <button key={option} type="button" onClick={() => setMode(option)} className={`rounded-xl px-3 py-2 text-sm transition ${mode === option ? 'bg-cyan-400 font-semibold text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <ErrorState message={error} />}
                {loading && <LoadingState message="Loading opportunities..." />}
                {!loading && !error && jobs.length === 0 && <EmptyState title="No matching roles" message="Try a different search term or work-mode filter." />}

                {!loading && !error && jobs.length > 0 && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {jobs.map((job) => (
                            <article key={job.id} className="rounded-3xl border border-white/10 bg-slate-900 p-6 transition hover:border-cyan-400/40">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xl font-semibold text-white">{job.title}</p>
                                        <p className="mt-1 text-slate-400">{job.company}</p>
                                    </div>
                                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">{job.type}</span>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
                                    <span className="flex items-center gap-2"><MapPin size={15} className="text-cyan-300" />{job.location}</span>
                                    <span className="flex items-center gap-2"><BriefcaseBusiness size={15} className="text-cyan-300" />{job.mode}</span>
                                </div>
                                <p className="mt-5 leading-7 text-slate-300">{job.description}</p>
                                <div className="mt-5 flex flex-wrap gap-2">{job.skills.map((skill) => <span key={skill} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{skill}</span>)}</div>
                                <button type="button" onClick={() => loadMatch(job.id)} disabled={matchingJob === job.id} className="mt-5 flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-70">
                                    <Sparkles size={16} />{matchingJob === job.id ? 'Calculating...' : matches[job.id] ? 'Refresh match' : 'Check my match'}
                                </button>
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
