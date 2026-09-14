import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Settings() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [account, setAccount] = useState({ name: user?.name || '', email: user?.email || '' })
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const request = async (path, options) => {
        const token = localStorage.getItem('careeros-token')
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Request failed.')
        return data
    }

    const saveAccount = async (event) => {
        event.preventDefault()
        setSaving(true); setError(''); setMessage('')
        try {
            await request('/auth/account', { method: 'PUT', body: JSON.stringify(account) })
            setMessage('Account details updated successfully.')
        } catch (err) { setError(err.message) } finally { setSaving(false) }
    }

    const savePassword = async (event) => {
        event.preventDefault()
        setSaving(true); setError(''); setMessage('')
        try {
            await request('/auth/password', { method: 'PUT', body: JSON.stringify(passwords) })
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setMessage('Password changed successfully.')
        } catch (err) { setError(err.message) } finally { setSaving(false) }
    }

    const deleteAccount = async () => {
        if (!window.confirm('Delete your account permanently? This action cannot be undone.')) return
        setSaving(true); setError('')
        try {
            await request('/auth/account', { method: 'DELETE' })
            logout()
            navigate('/')
        } catch (err) { setError(err.message); setSaving(false) }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Phase 14</p><h1 className="mt-2 text-3xl font-semibold">Settings</h1></div><button type="button" onClick={() => navigate('/dashboard')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">Back to dashboard</button></div>
                {message && <div className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">{message}</div>}
                {error && <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
                <div className="grid gap-6 lg:grid-cols-2">
                    <form onSubmit={saveAccount} className="rounded-3xl border border-white/10 bg-slate-900 p-6"><h2 className="text-xl font-semibold">Account details</h2><p className="mt-2 text-sm text-slate-400">Keep your identity information up to date.</p><div className="mt-5 space-y-4"><Field label="Name" value={account.name} onChange={(value) => setAccount({ ...account, name: value })} /><Field label="Email" type="email" value={account.email} onChange={(value) => setAccount({ ...account, email: value })} /></div><button disabled={saving} className="mt-5 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-70">Save details</button></form>
                    <form onSubmit={savePassword} className="rounded-3xl border border-white/10 bg-slate-900 p-6"><h2 className="text-xl font-semibold">Change password</h2><p className="mt-2 text-sm text-slate-400">Verify your current password before choosing a new one.</p><div className="mt-5 space-y-4"><Field label="Current password" type="password" value={passwords.currentPassword} onChange={(value) => setPasswords({ ...passwords, currentPassword: value })} /><Field label="New password" type="password" value={passwords.newPassword} onChange={(value) => setPasswords({ ...passwords, newPassword: value })} /><Field label="Confirm new password" type="password" value={passwords.confirmPassword} onChange={(value) => setPasswords({ ...passwords, confirmPassword: value })} /></div><button disabled={saving} className="mt-5 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-70">Change password</button></form>
                </div>
                <section className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/5 p-6"><h2 className="text-xl font-semibold text-red-200">Danger zone</h2><p className="mt-2 text-sm text-slate-400">Deleting your account permanently removes access to AI CareerOS.</p><button type="button" disabled={saving} onClick={deleteAccount} className="mt-5 rounded-xl border border-red-400/40 px-4 py-3 font-semibold text-red-200 hover:bg-red-400/10 disabled:opacity-70">Delete account</button></section>
            </div>
        </main>
    )
}

function Field({ label, value, onChange, type = 'text' }) {
    return <label className="block text-sm text-slate-300"><span className="mb-2 block">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400" /></label>
}
