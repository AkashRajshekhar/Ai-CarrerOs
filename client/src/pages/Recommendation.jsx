import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'

export default function Recommendation() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                const token = localStorage.getItem('careeros-token')
                const response = await axios.get('http://localhost:5000/api/recommendation', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setData(response.data.data)
            } catch (err) {
                if (err.response?.status === 404) {
                    setData(null)
                    setError('')
                } else {
                    setError(err.response?.data?.message || 'Unable to load your recommendation yet.')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchRecommendation()
    }, [])

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Your direction</p>
                        <h1 className="mt-2 text-3xl font-semibold">Career Recommendation</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                    >
                        Back to dashboard
                    </button>
                </div>

                {loading && <LoadingState message="Loading your recommendation..." />}

                {error && (
                    <ErrorState message={error} />
                )}

                {!loading && !error && !data && <EmptyState title="No recommendation yet" message="Complete the career assessment to generate your best-fit career path." />}

                {data && (
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Top career match</p>
                                    <h2 className="mt-2 text-3xl font-semibold text-white">{data.career}</h2>
                                </div>
                                <div className="rounded-full border border-cyan-400/30 bg-slate-950/50 px-4 py-2 text-sm text-cyan-100">
                                    {data.matchLabel}
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                <Stat label="Compatibility" value={`${data.compatibility}%`} accent="cyan" />
                                <Stat label="Suggested roles" value={data.roles.length} accent="violet" />
                                <Stat label="Priority focus" value={data.skillGaps[0]} accent="emerald" />
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                                <h3 className="text-xl font-semibold text-white">Why this fits</h3>
                                <p className="mt-3 leading-7 text-slate-300">{data.summary}</p>
                                <ul className="mt-4 space-y-3">
                                    {data.reasons.map((reason) => (
                                        <li key={reason} className="flex gap-3 text-slate-200">
                                            <span className="text-cyan-300">•</span>
                                            <span>{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                                <h3 className="text-xl font-semibold text-white">Suggested roles</h3>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {data.roles.map((role) => (
                                        <span key={role} className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-sm text-violet-100">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                                <h3 className="text-xl font-semibold text-white">Skill gaps to work on</h3>
                                <ul className="mt-4 space-y-3">
                                    {data.skillGaps.map((skill) => (
                                        <li key={skill} className="flex gap-3 text-slate-200">
                                            <span className="text-amber-300">•</span>
                                            <span>{skill}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                                <h3 className="text-xl font-semibold text-white">Roadmap</h3>
                                <ol className="mt-4 space-y-3">
                                    {data.roadmap.map((step, index) => (
                                        <li key={step} className="flex gap-3 text-slate-200">
                                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-slate-950">
                                                {index + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </main>
    )
}

function Stat({ label, value, accent }) {
    const accentMap = {
        cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
        violet: 'border-violet-400/30 bg-violet-500/10 text-violet-100',
        emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    }

    return (
        <div className={`rounded-2xl border p-4 ${accentMap[accent]}`}>
            <p className="text-sm text-slate-300">{label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{value}</p>
        </div>
    )
}
