import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ResumeAnalyzer() {
    const navigate = useNavigate()
    const { api } = useAuth()
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingResult, setLoadingResult] = useState(true)
    const [error, setError] = useState('')

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0] || null
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setFile(null)
            setError('Please select a PDF file only.')
            return
        }
        if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
            setFile(null)
            setError('Resume files must be smaller than 5 MB.')
            return
        }
        setError('')
        setFile(selectedFile)
    }

    useEffect(() => {
        const fetchCurrentAnalysis = async () => {
            try {
                const response = await api.get('/resume')
                setResult(response.data.data)
            } catch (err) {
                if (err.response?.status !== 404) setError(err.response?.data?.message || 'Unable to load your resume analysis.')
            } finally {
                setLoadingResult(false)
            }
        }

        fetchCurrentAnalysis()
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!file) {
            setError('Please select a PDF resume to upload.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('resume', file)

            const response = await api.post('/resume/upload', formData)

            setResult(response.data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to analyze this resume.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Resume workshop</p>
                        <h1 className="mt-2 text-3xl font-semibold">Resume Analyzer</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                    >
                        Back to dashboard
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-900 p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end">
                        <div className="flex-1">
                            <label className="mb-2 block text-sm text-slate-300">Upload your PDF resume</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? 'Analyzing...' : 'Analyze resume'}
                        </button>
                    </div>
                </form>

                {loadingResult && !result && (
                    <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-6 text-slate-300">
                        Loading your last analysis...
                    </div>
                )}

                {result && (
                    <section className="mt-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Resume score</p>
                                <h2 className="mt-2 text-3xl font-semibold text-white">{result.score}/100</h2>
                            </div>
                            <div className="rounded-full border border-emerald-400/30 bg-slate-950/40 px-4 py-2 text-sm text-emerald-100">
                                {result.fileName}
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-slate-200">
                            {result.summary}
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                                <h3 className="text-lg font-semibold text-white">Strengths</h3>
                                <ul className="mt-3 space-y-2 text-slate-200">
                                    {(result.strengths || []).map((point) => (
                                        <li key={point} className="flex gap-2"><span className="text-emerald-300">•</span><span>{point}</span></li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                                <h3 className="text-lg font-semibold text-white">Improvement areas</h3>
                                <ul className="mt-3 space-y-2 text-slate-200">
                                    {(result.gaps || []).map((point) => (
                                        <li key={point} className="flex gap-2"><span className="text-amber-300">•</span><span>{point}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                            <h3 className="text-lg font-semibold text-white">Suggestions</h3>
                            <ul className="mt-3 space-y-2 text-slate-200">
                                {(result.suggestions || []).map((point) => (
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
