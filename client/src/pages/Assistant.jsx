import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Bot, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Assistant() {
    const navigate = useNavigate()
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const token = localStorage.getItem('careeros-token')
                const response = await axios.get(`${API_URL}/assistant/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setMessages(response.data.data || [])
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load assistant history.')
            } finally {
                setLoading(false)
            }
        }

        loadHistory()
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault()
        const trimmedMessage = message.trim()
        if (!trimmedMessage) {
            setError('Please ask the assistant a question or request guidance.')
            return
        }

        setSending(true)
        setError('')
        setMessages((current) => [...current, { role: 'user', content: trimmedMessage }])
        setMessage('')

        try {
            const token = localStorage.getItem('careeros-token')
            const response = await axios.post(`${API_URL}/assistant`, { message: trimmedMessage }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setMessages(response.data.data.messages)
        } catch (err) {
            setMessages((current) => current.slice(0, -1))
            setError(err.response?.data?.message || 'Unable to generate a response right now.')
        } finally {
            setSending(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Phase 13</p>
                        <h1 className="mt-2 text-3xl font-semibold">CareerOS Assistant</h1>
                    </div>
                    <button type="button" onClick={() => navigate('/dashboard')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">Back to dashboard</button>
                </div>

                {error && <ErrorState message={error} />}

                <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 md:p-6">
                    <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4"><div className="rounded-xl bg-cyan-400 p-2 text-slate-950"><Bot size={19} /></div><div><p className="font-semibold">Your career copilot</p><p className="text-sm text-slate-400">Personalized guidance based on your profile and progress.</p></div></div>
                    <div className="min-h-80 space-y-4">
                        {loading && <LoadingState message="Loading your conversation..." />}
                        {!loading && messages.length === 0 && <EmptyState title="Start your career conversation" message="Ask about careers, skills, resumes, projects, interviews, or learning plans." />}
                        {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 leading-7 ${item.role === 'user' ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 bg-slate-950 text-slate-200'}`}>{item.role === 'user' ? item.content : <div className="space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold"><ReactMarkdown>{item.content}</ReactMarkdown></div>}</div></div>)}
                        {sending && <div className="flex justify-start"><div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-400">Thinking...</div></div>}
                    </div>
                    <form onSubmit={handleSubmit} className="mt-5 flex gap-3 border-t border-white/10 pt-5"><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={2} placeholder="Ask for career guidance..." className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400" /><button type="submit" disabled={sending} aria-label="Send message" className="self-end rounded-xl bg-cyan-400 p-3 text-slate-950 hover:bg-cyan-300 disabled:opacity-70"><Send size={18} /></button></form>
                </section>
            </div>
        </main>
    )
}