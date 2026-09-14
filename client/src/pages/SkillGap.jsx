import { useEffect, useState } from 'react'
import { Check, CircleAlert, CircleDashed } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const careers = ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'AI / ML Engineer', 'Data Analyst', 'Cloud / DevOps Engineer']

const statusStyles = {
    Mastered: { icon: Check, className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' },
    Intermediate: { icon: Check, className: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200' },
    Beginner: { icon: CircleDashed, className: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
    Missing: { icon: CircleAlert, className: 'border-red-400/30 bg-red-400/10 text-red-200' },
}

export default function SkillGap() {
    const navigate = useNavigate()
    const [career, setCareer] = useState('')
    const [additionalSkills, setAdditionalSkills] = useState('')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadSkillGap = async () => {
            setLoading(true)
            setError('')
            try {
                const token = localStorage.getItem('careeros-token')
                const params = career ? { career, extraSkills: additionalSkills } : {}
                const response = await axios.get(`${API_URL}/skill-gap`, { params, headers: { Authorization: `Bearer ${token}` } })
                setData(response.data.data)
                setCareer(response.data.data.targetCareer)
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to generate skill gap analysis.')
            } finally {
                setLoading(false)
            }
        }

        loadSkillGap()
    }, [career, additionalSkills])

    const handleCareerChange = (event) => {
        const nextCareer = event.target.value
        if (nextCareer !== career) setCareer(nextCareer)
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Phase 8</p>
                        <h1 className="mt-2 text-3xl font-semibold">Skill Gap Analysis</h1>
                        <p className="mt-2 text-slate-400">See what to learn next for your target career.</p>
                    </div>
                    <button type="button" onClick={() => navigate('/dashboard')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">Back to dashboard</button>
                </div>

                <section className="mb-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
                    <label htmlFor="target-career" className="mb-2 block text-sm text-slate-300">Target career</label>
                    <select id="target-career" value={career} onChange={handleCareerChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400 md:max-w-md">
                        {careers.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <label htmlFor="additional-skills" className="mt-4 mb-2 block text-sm text-slate-300">Additional skills</label>
                    <input id="additional-skills" value={additionalSkills} onChange={(event) => setAdditionalSkills(event.target.value)} placeholder="Add skills separated by commas, for example TypeScript, Docker" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400" />
                </section>

                {error && <ErrorState message={error} />}
                {loading && <LoadingState message="Comparing your skills with the target career..." />}
                {!loading && !data && !error && <EmptyState title="No skill-gap analysis yet" message="Select a target career to compare it with your profile skills." />}

                {!loading && data && (
                    <>
                        <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                <div><p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Career readiness</p><h2 className="mt-2 text-3xl font-semibold">{data.targetCareer}</h2></div>
                                <div className="text-left md:text-right"><p className="text-4xl font-semibold text-white">{data.completion}%</p><p className="text-sm text-cyan-100">skills covered</p></div>
                            </div>
                            <div className="mt-6 h-3 rounded-full bg-slate-950/60"><div className="h-3 rounded-full bg-cyan-400 transition-all" style={{ width: `${data.completion}%` }} /></div>
                        </section>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
                            <section className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                                <h2 className="text-xl font-semibold">Required skills</h2>
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">{data.skills.map((skill) => { const style = statusStyles[skill.status]; const Icon = style.icon; return <div key={skill.name} className={`flex items-center justify-between rounded-2xl border p-3 ${style.className}`}><span className="flex items-center gap-2"><Icon size={17} />{skill.name}</span><span className="text-xs">{skill.status}</span></div> })}</div>
                            </section>
                            <section className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                                <h2 className="text-xl font-semibold">Recommended learning order</h2>
                                <ol className="mt-5 space-y-3">{data.learningOrder.map((skill, index) => <li key={skill} className="flex gap-3 text-slate-200"><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-slate-950">{index + 1}</span><span>{skill}</span></li>)}</ol>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}
