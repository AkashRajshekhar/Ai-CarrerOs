import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (event) => {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await login(form.email, form.password)
            const destination = location.state?.from
            navigate(typeof destination === 'string' ? destination : destination?.pathname || (result.user?.role === 'recruiter' ? '/recruiter' : result.user?.role === 'admin' ? '/admin' : '/dashboard'), { replace: true })
        } catch (err) {
            setError(err.userMessage || err.response?.data?.message || 'Unable to login. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-cyan-950/30">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Welcome back</p>
                <h1 className="mt-3 text-3xl font-semibold">Login to AI CareerOS</h1>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm text-slate-300">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-400"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm text-slate-300">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-6 text-sm text-slate-400">
                    Don’t have an account?{' '}
                    <Link to="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    )
}
