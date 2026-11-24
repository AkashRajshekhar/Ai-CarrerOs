import { useEffect, useState } from 'react'
import { Bookmark, BriefcaseBusiness, MapPin } from 'lucide-react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Applications() {
    const { token } = useAuth()
    const [applications, setApplications] = useState([])
    const [savedJobs, setSavedJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadData = async () => {
        setError('')
        try {
            const headers = { Authorization: `Bearer ${token}` }
            const [applicationResponse, savedResponse] = await Promise.all([
                axios.get(`${API_URL}/jobs/applications`, { headers }),
                axios.get(`${API_URL}/jobs/saved`, { headers }),
            ])
            setApplications(applicationResponse.data.data.applications)
            setSavedJobs(savedResponse.data.data.jobs)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to load your saved jobs and applications.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [token])

    const removeSavedJob = async (jobId) => {
        try {
            await axios.delete(`${API_URL}/jobs/${jobId}/save`, { headers: { Authorization: `Bearer ${token}` } })
            setSavedJobs((current) => current.filter((job) => job.id !== jobId))
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to remove the saved job.')
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div><p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Your job search</p><h1 className="mt-2 text-3xl font-semibold">Applications & saved jobs</h1><p className="mt-2 text-slate-400">Track submitted applications and revisit roles you saved.</p></div>
                    <Link to="/jobs" className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Browse jobs</Link>
                </header>
                {error && <div className="mb-5"><ErrorState message={error} onRetry={loadData} /></div>}
                {loading ? <LoadingState message="Loading your job activity..." /> : <div className="grid items-start gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                        <h2 className="mb-4 text-xl font-semibold">Applications <span className="text-sm font-normal text-slate-500">{applications.length}</span></h2>
                        {applications.length ? <div className="space-y-3">{applications.map((application) => <article key={application._id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                            <h3 className="font-semibold">{application.job?.title || 'Listing unavailable'}</h3><p className="mt-1 text-sm text-slate-400">{application.job?.company || 'Company unavailable'}</p>
                            <p className="mt-3 text-xs uppercase tracking-wide text-cyan-700">{application.status}</p><p className="mt-1 text-xs text-slate-500">Submitted {new Date(application.createdAt).toLocaleDateString()}</p>
                        </article>)}</div> : <EmptyState title="No applications yet" message="Applications you submit will be tracked here." />}
                    </section>
                    <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Bookmark size={18} className="text-cyan-600" />Saved jobs <span className="text-sm font-normal text-slate-500">{savedJobs.length}</span></h2>
                        {savedJobs.length ? <div className="space-y-3">{savedJobs.map((job) => <article key={job.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                            <h3 className="font-semibold">{job.title}</h3><p className="mt-1 text-sm text-slate-400">{job.company}</p><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin size={14} />{job.location}<BriefcaseBusiness size={14} />{job.type}</p>
                            <div className="mt-4 flex gap-2"><Link to={`/jobs?search=${encodeURIComponent(job.title)}`} className="rounded-lg bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-300">View listing</Link><button type="button" onClick={() => removeSavedJob(job.id)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 hover:bg-white/5">Remove</button></div>
                        </article>)}</div> : <EmptyState title="No saved jobs" message="Save promising roles from the job board to revisit them here." />}
                    </section>
                </div>}
            </div>
        </main>
    )
}