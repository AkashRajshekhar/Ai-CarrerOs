import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Clock3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'
import ProgressBar from '../components/ui/ProgressBar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Roadmap() {
    const navigate = useNavigate()
    const [roadmap, setRoadmap] = useState(null)
    const [hours, setHours] = useState(8)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState('')

    const loadRoadmap = async () => {
        try {
            const token = localStorage.getItem('careeros-token')
            const response = await axios.get(`${API_URL}/roadmap`, { headers: { Authorization: `Bearer ${token}` } })
            setRoadmap(response.data.data)
            setHours(response.data.data.availableHoursPerWeek)
        } catch (err) {
            if (err.response?.status !== 404) setError(err.response?.data?.message || 'Unable to load your roadmap.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadRoadmap() }, [])

    const generate = async (event) => {
        event.preventDefault()
        setGenerating(true)
        setError('')
        try {
            const token = localStorage.getItem('careeros-token')
            const response = await axios.post(`${API_URL}/roadmap/generate`, { availableHoursPerWeek: Number(hours) }, { headers: { Authorization: `Bearer ${token}` } })
            setRoadmap(response.data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to generate your roadmap.')
        } finally {
            setGenerating(false)
        }
    }

    const toggleItem = async (item) => {
        try {
            const token = localStorage.getItem('careeros-token')
            const response = await axios.put(`${API_URL}/roadmap/${item._id}`, { completed: !item.completed }, { headers: { Authorization: `Bearer ${token}` } })
            setRoadmap(response.data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to update roadmap progress.')
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div><p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Your learning path</p><h1 className="mt-2 text-3xl font-semibold">Personalized Roadmap</h1><p className="mt-2 text-slate-400">Turn your skill gaps into a practical learning plan.</p></div>
                    <button type="button" onClick={() => navigate('/dashboard')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">Back to dashboard</button>
                </div>

                <form onSubmit={generate} className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900 p-5 md:flex-row md:items-end md:justify-between">
                    <div><label htmlFor="hours" className="mb-2 block text-sm text-slate-300">Available hours per week</label><input id="hours" type="number" min="1" max="80" value={hours} onChange={(event) => setHours(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400 md:w-48" /></div>
                    <button type="submit" disabled={generating} className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-70">{generating ? 'Generating...' : roadmap ? 'Regenerate roadmap' : 'Generate roadmap'}</button>
                </form>

                {error && <ErrorState message={error} />}
                {loading && <LoadingState message="Loading your roadmap..." />}
                {!loading && !roadmap && !error && <EmptyState title="No roadmap yet" message="Complete a skill-gap analysis, then generate a personalized learning plan." />}

                {!loading && roadmap && <>
                    <section className="mb-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Target career</p><h2 className="mt-2 text-2xl font-semibold">{roadmap.targetCareer}</h2></div><div className="text-left md:text-right"><p className="text-3xl font-semibold">{roadmap.progress}%</p><p className="text-sm text-cyan-100">roadmap complete</p></div></div><ProgressBar value={roadmap.progress} className="mt-5" /></section>
                    <div className="space-y-4">{roadmap.items.map((item, index) => <article key={item._id} className={`rounded-3xl border p-5 transition ${item.completed ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-white/10 bg-slate-900'}`}><div className="flex gap-4"><button type="button" onClick={() => toggleItem(item)} aria-label={item.completed ? `Mark ${item.skill} incomplete` : `Mark ${item.skill} complete`} className="mt-1 shrink-0 text-cyan-300">{item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}</button><div className="min-w-0 flex-1"><div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><p className="text-xs uppercase tracking-[0.15em] text-slate-500">Step {index + 1}</p><h3 className={`mt-1 text-xl font-semibold ${item.completed ? 'text-emerald-200 line-through' : 'text-white'}`}>{item.skill}</h3></div><span className="flex items-center gap-2 text-sm text-slate-400"><Clock3 size={15} />{item.estimatedHours} hours</span></div><p className="mt-3 leading-7 text-slate-300">{item.description}</p><div className="mt-4 grid gap-3 text-sm md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3"><p className="text-slate-500">Project idea</p><p className="mt-1 text-slate-200">{item.project}</p></div><div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3"><p className="text-slate-500">Prerequisites</p><p className="mt-1 text-slate-200">{item.prerequisites.join(' • ')}</p></div></div></div></div></article>)}</div>
                </>}
            </div>
        </main>
    )
}
