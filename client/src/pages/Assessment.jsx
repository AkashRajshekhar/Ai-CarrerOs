import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'

const questions = [
    {
        key: 'programmingInterest',
        question: 'How interested are you in programming and building software products?',
        options: ['Not interested', 'Slightly interested', 'Moderately interested', 'Very interested', 'Extremely interested'],
    },
    {
        key: 'problemSolving',
        question: 'How naturally do you enjoy solving technical or logical problems?',
        options: ['Very little', 'A little', 'Sometimes', 'Often', 'Very strongly'],
    },
    {
        key: 'mathComfort',
        question: 'How comfortable are you with mathematics, logic, and analytical reasoning?',
        options: ['Uncomfortable', 'Low', 'Moderate', 'Comfortable', 'Very comfortable'],
    },
    {
        key: 'creativity',
        question: 'How creative do you feel when designing products, UX, or digital experiences?',
        options: ['Not creative', 'Minimal', 'Somewhat', 'Strongly', 'Very strongly'],
    },
    {
        key: 'communication',
        question: 'How strong are your communication and teamwork skills?',
        options: ['Weak', 'Limited', 'Okay', 'Strong', 'Excellent'],
    },
    {
        key: 'techInterest',
        question: 'How excited are you about modern technology, AI, cloud, and digital tools?',
        options: ['Not excited', 'Low', 'Moderate', 'High', 'Very high'],
    },
    {
        key: 'workStyle',
        question: 'What kind of work style suits you best?',
        options: ['Independent tasks', 'Mostly structured tasks', 'Balanced teamwork', 'Collaborative leadership', 'Innovation-driven leadership'],
    },
    {
        key: 'careerPreference',
        question: 'Which career orientation sounds most natural to you?',
        options: ['Pure theory', 'Hands-on delivery', 'Problem-solving', 'Product building', 'Research and innovation'],
    },
]

const initialAnswers = Object.fromEntries(questions.map((question) => [question.key, 3]))

export default function Assessment() {
    const navigate = useNavigate()
    const [answers, setAnswers] = useState(initialAnswers)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const [result, setResult] = useState(null)

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const token = localStorage.getItem('careeros-token')
                const response = await axios.get('http://localhost:5000/api/assessment', {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (response.data?.data?.answers) {
                    setAnswers(response.data.data.answers)
                    setResult(response.data.data.result)
                }
            } catch (err) {
                // No previous assessment yet; keep blank.
            } finally {
                setFetching(false)
            }
        }

        fetchAssessment()
    }, [])

    const progress = useMemo(() => {
        const answered = Object.values(answers).filter((value) => Number.isInteger(value) && value >= 1).length
        return Math.round((answered / questions.length) * 100)
    }, [answers])

    const handleAnswer = (questionKey, value) => {
        setAnswers((current) => ({ ...current, [questionKey]: Number(value) }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('careeros-token')
            const response = await axios.post('http://localhost:5000/api/assessment', { answers }, {
                headers: { Authorization: `Bearer ${token}` },
            })

            setResult(response.data.data.result)
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to save the assessment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Phase 5</p>
                        <h1 className="mt-2 text-3xl font-semibold">Career Assessment</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                    >
                        Back to dashboard
                    </button>
                </div>

                <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-cyan-100">
                        <span>Assessment progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-cyan-950/60">
                        <div className="h-2.5 rounded-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {error && (
                    <div className="mb-6"><ErrorState message={error} /></div>
                )}

                {fetching && <div className="mb-6"><LoadingState message="Loading your previous assessment..." /></div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {questions.map((question, index) => (
                        <div key={question.key} className="rounded-3xl border border-white/10 bg-slate-900 p-5 md:p-6">
                            <p className="mb-4 text-sm text-slate-400">Question {index + 1}</p>
                            <h2 className="text-xl font-medium text-white">{question.question}</h2>
                            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                {question.options.map((option, optionIndex) => {
                                    const selected = answers[question.key] === optionIndex + 1
                                    return (
                                        <label
                                            key={option}
                                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${selected
                                                ? 'border-cyan-400 bg-cyan-400/10 text-cyan-100'
                                                : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={question.key}
                                                value={optionIndex + 1}
                                                checked={selected}
                                                onChange={(event) => handleAnswer(question.key, event.target.value)}
                                                className="mt-1 accent-cyan-400"
                                            />
                                            <span className="text-sm leading-6">{option}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setAnswers(initialAnswers)}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-200 hover:bg-white/10"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={loading || fetching}
                            className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? 'Saving assessment...' : 'Submit assessment'}
                        </button>
                    </div>
                </form>

                {result && (
                    <section className="mt-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Assessment result</p>
                        <h2 className="mt-3 text-3xl font-semibold text-white">Best fit: {result.topCareer}</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                                <p className="text-sm text-slate-400">Career match</p>
                                <p className="mt-2 text-2xl font-semibold text-cyan-200">{result.topCareerScore}/30</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                                <p className="text-sm text-slate-400">Average score</p>
                                <p className="mt-2 text-2xl font-semibold text-violet-200">{result.averageScore}%</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                                <p className="text-sm text-slate-400">Recommended focus</p>
                                <p className="mt-2 text-sm font-medium text-emerald-200">{result.recommendations[0]}</p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Strengths</h3>
                                <ul className="mt-3 space-y-2 text-slate-200">
                                    {result.strengths.map((point) => (
                                        <li key={point} className="flex gap-2"><span className="text-emerald-300">•</span><span>{point}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Growth areas</h3>
                                <ul className="mt-3 space-y-2 text-slate-200">
                                    {result.gaps.map((point) => (
                                        <li key={point} className="flex gap-2"><span className="text-amber-300">•</span><span>{point}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white">Suggestions</h3>
                            <ul className="mt-3 space-y-2 text-slate-200">
                                {result.recommendations.map((point) => (
                                    <li key={point} className="flex gap-2"><span className="text-cyan-300">•</span><span>{point}</span></li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}
            </div>
        </main>
    )
}
