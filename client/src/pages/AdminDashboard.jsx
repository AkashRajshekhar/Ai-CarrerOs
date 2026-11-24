import { useEffect, useState } from 'react'
import { ShieldCheck, Trash2, Users, UserCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function initials(name = '') {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || '?'
}

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionError, setActionError] = useState('')
    const [updatingId, setUpdatingId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [confirmTarget, setConfirmTarget] = useState(null)

    const loadOverview = async () => {
        try {
            const token = localStorage.getItem('careeros-token')
            const response = await axios.get(`${API_URL}/admin/overview`, { headers: { Authorization: `Bearer ${token}` } })
            setData(response.data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to load admin dashboard.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadOverview() }, [])

    const updateRole = async (userId, role) => {
        setActionError('')
        setUpdatingId(userId)
        try {
            const token = localStorage.getItem('careeros-token')
            await axios.patch(`${API_URL}/admin/users/${userId}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } })
            await loadOverview()
        } catch (err) {
            setActionError(err.response?.data?.message || 'Unable to update role.')
        } finally {
            setUpdatingId(null)
        }
    }

    const removeUser = async (userId) => {
        setActionError('')
        setDeletingId(userId)
        try {
            const token = localStorage.getItem('careeros-token')
            await axios.delete(`${API_URL}/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
            await loadOverview()
        } catch (err) {
            setActionError(err.response?.data?.message || 'Unable to delete user.')
        } finally {
            setDeletingId(null)
            setConfirmTarget(null)
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Platform control</p>
                        <h1 className="mt-2 text-3xl font-semibold">Admin Dashboard</h1>
                        <p className="mt-2 text-slate-400">Manage platform access and student accounts.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 sm:self-auto"
                    >
                        Back to dashboard
                    </button>
                </div>

                {error && <ErrorState message={error} onRetry={loadOverview} />}
                {loading && <LoadingState message="Loading admin overview..." />}

                {!loading && !error && data && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Stat icon={Users} label="Total users" value={data.stats.totalUsers} />
                            <Stat icon={Users} label="Candidates" value={data.stats.students} />
                            <Stat icon={Users} label="Recruiters" value={data.stats.recruiters || 0} />
                            <Stat icon={ShieldCheck} label="Admins" value={data.stats.admins} />
                        </div>

                        <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5 md:p-6">
                            <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-cyan-400 p-2 text-slate-950">
                                        <UserCog size={19} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">User management</h2>
                                        <p className="mt-1 text-sm text-slate-400">Review accounts and manage roles.</p>
                                    </div>
                                </div>
                            </div>

                            {actionError && (
                                <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                                    {actionError}
                                </div>
                            )}

                            {data.users.length === 0 ? (
                                <EmptyState title="No users yet" message="Once students sign up, they'll show up here." />
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-white/5">
                                    <table className="w-full min-w-162.5 text-left text-sm">
                                        <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3">User</th>
                                                <th className="px-4 py-3">Email</th>
                                                <th className="px-4 py-3">Role</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.users.map((account) => {
                                                const isSelf = String(account._id) === String(user?.id)
                                                const isUpdating = updatingId === account._id
                                                const isDeleting = deletingId === account._id
                                                return (
                                                    <tr key={account._id} className="border-b border-white/5 transition hover:bg-white/5">
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-300">
                                                                    {initials(account.name)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-white">{account.name}</p>
                                                                    {isSelf && <span className="text-xs text-cyan-300">You</span>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-slate-300">{account.email}</td>
                                                        <td className="px-4 py-4">
                                                            <select
                                                                value={account.role}
                                                                disabled={isSelf || isUpdating}
                                                                onChange={(event) => updateRole(account._id, event.target.value)}
                                                                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-200 transition focus:border-cyan-400 disabled:opacity-40"
                                                            >
                                                                <option value="student">Student</option>
                                                                <option value="recruiter">Recruiter</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                            {isUpdating && <span className="ml-2 text-xs text-slate-400">Saving...</span>}
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                disabled={isSelf || isDeleting}
                                                                onClick={() => setConfirmTarget(account)}
                                                                aria-label={`Delete ${account.name}`}
                                                                className="rounded-lg p-2 text-red-300 transition hover:bg-red-400/10 disabled:opacity-30"
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>

            <Modal
                open={Boolean(confirmTarget)}
                title="Delete this user?"
                onClose={() => setConfirmTarget(null)}
            >
                <p className="text-sm text-slate-300">
                    This will permanently delete <span className="font-semibold text-white">{confirmTarget?.name}</span> ({confirmTarget?.email}). This action cannot be undone.
                </p>
                <div className="mt-5 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setConfirmTarget(null)}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <Button
                        variant="danger"
                        type="button"
                        onClick={() => removeUser(confirmTarget._id)}
                        className="px-4 py-2 text-sm"
                    >
                        {deletingId === confirmTarget?._id ? 'Deleting...' : 'Delete user'}
                    </Button>
                </div>
            </Modal>
        </main>
    )
}

function Stat({ icon: Icon, label, value }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
            <Icon className="text-cyan-300" size={20} />
            <p className="mt-5 text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-semibold">{value}</p>
        </div>
    )
}