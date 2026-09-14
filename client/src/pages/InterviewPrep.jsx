import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'

export default function InterviewPrep() {
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [answers, setAnswers] = useState({})
    const [textAnswers, setTextAnswers] = useState({})
    const [role, setRole] = useState('Full Stack Developer')
    const [difficulty, setDifficulty] = useState('Intermediate')
    const [interviewType, setInterviewType] = useState('Behavioral')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem('careeros-token')
                const response = await axios.get('http://localhost:5000/api/interview', {
                    params: { role, difficulty, type: interviewType },
                    headers: { Authorization: `Bearer ${token}` },
                })

                setQuestions(response.data.data.questions)
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load interview questions.')
            } finally {
                setLoading(false)
            }
        }

        fetchQuestions()
    }, [role, difficulty, interviewType])

    const handleAnswerChange = (questionId, value) => {
        setAnswers((current) => ({ ...current, [questionId]: Number(value) }))
    }

    const handleTextAnswerChange = (questionId, value) => {
        setTextAnswers((current) => ({ ...current, [questionId]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            const token = localStorage.getItem('careeros-token')
            const response = await axios.post('http://localhost:5000/api/interview/submit', { answers, textAnswers, role, difficulty, interviewType }, {
                headers: { Authorization: `Bearer ${token}` },
            })

            setResult(response.data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to evaluate interview answers.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Phase 12</p>
                        <h1 className="mt-2 text-3xl font-semibold">Interview Prep</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                    >
                        Back to dashboard
                    </button>
                </div>

                {error && <ErrorState message={error} />}

                <section className="mb-6 grid gap-4 rounded-3xl border border-white/10 bg-slate-900 p-5 md:grid-cols-3">
                    <SelectField label="Role" value={role} onChange={setRole} options={['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'AI / ML Engineer']} />
                    <SelectField label="Difficulty" value={difficulty} onChange={setDifficulty} options={['Beginner', 'Intermediate', 'Advanced']} />
                    <SelectField label="Interview type" value={interviewType} onChange={setInterviewType} options={['Technical', 'HR', 'Behavioral', 'Coding']} />
                </section>

                {loading ? (
                    <LoadingState message="Loading prep questions..." />
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!questions.length && <EmptyState title="No questions available" message="Try another role or interview type." />}
                        {questions.map((question, index) => (
                            <div key={question.id} className="rounded-3xl border border-white/10 bg-slate-900 p-5 md:p-6">
                                <p className="mb-3 text-sm text-slate-400">Prompt {index + 1}</p>
                                <h2 className="text-xl font-medium text-white">{question.prompt}</h2>
                                <textarea
                                    value={textAnswers[question.id] || ''}
                                    onChange={(event) => handleTextAnswerChange(question.id, event.target.value)}
                                    rows={3}
                                    placeholder="Write your answer here for detailed feedback..."
                                    className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                                />
                                <div className="mt-5 grid gap-3 md:grid-cols-5">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <label
                                            key={value}
                                            className={`flex cursor-pointer items-center justify-center rounded-2xl border px-3 py-3 text-sm transition ${answers[question.id] === value
                                                ? 'border-cyan-400 bg-cyan-400/10 text-cyan-100'
                                                : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={question.id}
                                                value={value}
                                                checked={answers[question.id] === value}
                                                onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                                                className="sr-only"
                                            />
                                            {value}
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-3">
                                    <p className="text-sm text-slate-400">Quick tips</p>
                                    <ul className="mt-2 space-y-1 text-sm text-slate-200">
                                        {question.tips.map((tip) => (
                                            <li key={tip} className="flex gap-2"><span className="text-cyan-300">•</span><span>{tip}</span></li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {submitting ? 'Evaluating...' : 'Submit answers'}
                            </button>
                        </div>
                    </form>
                )}

                {result && (
                    <section className="mt-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Interview readiness</p>
                        <h2 className="mt-3 text-3xl font-semibold text-white">{result.score}%</h2>
                        <p className="mt-3 text-slate-200">{result.summary}</p>
                        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                            <h3 className="text-lg font-semibold text-white">Recommended next steps</h3>
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

function SelectField({ label, value, onChange, options }) {
    return (
        <label className="block text-sm text-slate-300">
            <span className="mb-2 block">{label}</span>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400">
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
        </label>
    )
}
