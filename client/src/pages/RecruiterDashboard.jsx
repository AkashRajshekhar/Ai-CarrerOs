import { useEffect, useState } from 'react'
import { BriefcaseBusiness, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorState, LoadingState } from '../components/StateMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const emptyForm = {
    title: '',
    location: '',
    mode: 'On-site',
    employmentType: 'Full-time',
    experience: '',
    salary: '',
    skills: '',
    description: '',
    applicationUrl: '',
}
const applicationStatuses = ['submitted', 'reviewing', 'interview', 'rejected', 'hired']

export default function RecruiterDashboard() {
    const navigate = useNavigate()
    const { user, token } = useAuth()
    const [jobs, setJobs] = useState([])
    const [applications, setApplications] = useState([])
    const [form, setForm] = useState(emptyForm)
    const [editingId, setEditingId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    const headers = { Authorization: `Bearer ${token}` }
    const loadWorkspace = async () => {
        setError('')
        try {
            const [jobsResponse, applicationsResponse] = await Promise.all([
                axios.get(`${API_URL}/recruiter/jobs`, { headers }),
                axios.get(`${API_URL}/recruiter/applications`, { headers }),
            ])
            setJobs(jobsResponse.data.data.jobs)
            setApplications(applicationsResponse.data.data.applications)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to load your recruiter workspace.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadWorkspace() }, [token])

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId('')
    }

    const submitJob = async (event) => {
        event.preventDefault()
        setSaving(true)
        setError('')
        setNotice('')
        const location = form.mode === 'Hybrid' ? `${form.location.trim()} (Hybrid)` : form.location.trim()
        const payload = {
            ...form,
            location,
            remote: form.mode === 'Remote',
            skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
            isPublished: true,
        }
        delete payload.mode
        try {
            if (editingId) {
                await axios.put(`${API_URL}/recruiter/jobs/${editingId}`, payload, { headers })
                setNotice('Job posting updated.')
            } else {
                await axios.post(`${API_URL}/recruiter/jobs`, payload, { headers })
                setNotice('Job posting published.')
            }
            resetForm()
            await loadWorkspace()
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to save this job posting.')
        } finally {
            setSaving(false)
        }
    }

    const editJob = (job) => {
        setEditingId(job._id)
        setForm({
            title: job.title || '',
            location: (job.location || '').replace(/\s*\(Hybrid\)$/i, ''),
            mode: /\bhybrid\b/i.test(job.location) ? 'Hybrid' : job.remote ? 'Remote' : 'On-site',
            employmentType: job.employmentType || 'Full-time',
            experience: job.experience || '',
            salary: job.salary || '',
            skills: (job.skills || []).join(', '),
            description: job.description || '',
            applicationUrl: job.applicationUrl || '',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const deleteJob = async (job) => {
        if (!window.confirm(`Delete the ${job.title} posting and its applications?`)) return
        setError('')
        try {
            await axios.delete(`${API_URL}/recruiter/jobs/${job._id}`, { headers })
            setNotice('Job posting deleted.')
            await loadWorkspace()
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to delete this job posting.')
        }
    }

    const updateStatus = async (applicationId, status) => {
        setError('')
        try {
            await axios.patch(`${API_URL}/recruiter/applications/${applicationId}/status`, { status }, { headers })
            setApplications((current) => current.map((application) => application._id === applicationId ? { ...application, status } : application))
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to update application status.')
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Recruiter workspace</p>
                        <h1 className="mt-2 text-3xl font-semibold">{user?.companyName || 'Your company'}</h1>
                        <p className="mt-2 text-slate-400">Manage job listings and candidate applications. Recruiter accounts are not independently verified.</p>
                    </div>
                    <button type="button" onClick={() => navigate('/')} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">View platform</button>
                </header>

                {error && <div className="mb-4"><ErrorState message={error} onRetry={loadWorkspace} /></div>}
                {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-800">{notice}</p>}

                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                    <Summary label="Your postings" value={jobs.length} />
                    <Summary label="Published" value={jobs.filter((job) => job.isPublished).length} />
                    <Summary label="Applications" value={applications.length} />
                </div>

                <section className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <form onSubmit={submitJob} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div><p className="text-sm text-slate-400">{editingId ? 'Edit listing' : 'New listing'}</p><h2 className="text-xl font-semibold">{editingId ? 'Update job' : 'Post a job'}</h2></div>
                            {editingId && <button type="button" onClick={resetForm} aria-label="Cancel editing" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Job title" value={form.title} onChange={(title) => setForm({ ...form, title })} required />
                            <Field label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} required />
                            <SelectField label="Work mode" value={form.mode} onChange={(mode) => setForm({ ...form, mode })} options={['On-site', 'Hybrid', 'Remote']} />
                            <SelectField label="Employment type" value={form.employmentType} onChange={(employmentType) => setForm({ ...form, employmentType })} options={['Full-time', 'Part-time', 'Contract', 'Internship']} />
                            <Field label="Experience" value={form.experience} onChange={(experience) => setForm({ ...form, experience })} placeholder="e.g. 2-4 years" />
                            <Field label="Salary" value={form.salary} onChange={(salary) => setForm({ ...form, salary })} placeholder="e.g. INR 12-18 LPA" />
                            <Field label="Skills (comma separated)" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} required />
                            <Field label="Application URL (optional)" type="url" value={form.applicationUrl} onChange={(applicationUrl) => setForm({ ...form, applicationUrl })} />
                        </div>
                        <label className="mt-4 block text-sm text-slate-300">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required rows={5} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400" /></label>
                        <button type="submit" disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60">
                            {editingId ? <Save size={17} /> : <Plus size={17} />}{saving ? 'Saving...' : editingId ? 'Update listing' : 'Publish listing'}
                        </button>
                    </form>

                    <div className="space-y-6">
                        <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><BriefcaseBusiness size={19} className="text-cyan-300" />Your job postings</h2>
                            {loading ? <LoadingState message="Loading postings..." /> : jobs.length ? <div className="space-y-3">{jobs.map((job) => <article key={job._id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                                <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{job.title}</h3><p className="mt-1 text-sm text-slate-400">{job.location} · {job.employmentType}</p></div><span className="text-xs text-slate-500">{job.isPublished ? 'Published' : 'Draft'}</span></div>
                                <div className="mt-3 flex gap-2"><button type="button" onClick={() => editJob(job)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><Pencil size={14} />Edit</button><button type="button" onClick={() => deleteJob(job)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/40 px-3 py-2 text-sm text-red-700 hover:bg-red-50"><Trash2 size={14} />Delete</button></div>
                            </article>)}</div> : <p className="text-sm text-slate-400">No postings yet. Create your first job listing here.</p>}
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                            <h2 className="mb-4 text-xl font-semibold">Candidate applications</h2>
                            {loading ? <LoadingState message="Loading applications..." /> : applications.length ? <div className="space-y-3">{applications.map((application) => <article key={application._id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{application.candidate?.name || 'Candidate'}</h3><p className="mt-1 text-sm text-slate-400">{application.candidate?.email} · {application.job?.title}</p>{application.coverLetter && <p className="mt-3 max-w-prose text-sm leading-6 text-slate-300">{application.coverLetter}</p>}{application.resumeUrl && <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-cyan-700 underline">View resume</a>}</div>
                                    <SelectField label="Status" value={application.status} onChange={(status) => updateStatus(application._id, status)} options={applicationStatuses} /></div>
                            </article>)}</div> : <p className="text-sm text-slate-400">Applications to your published listings will appear here.</p>}
                        </section>
                    </div>
                </section>
            </div>
        </main>
    )
}

function Summary({ label, value }) {
    return <div className="rounded-xl border border-white/10 bg-slate-900 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>
}

function Field({ label, value, onChange, type = 'text', placeholder, required = false }) {
    return <label className="block text-sm text-slate-300">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400" /></label>
}

function SelectField({ label, value, onChange, options }) {
    return <label className="block text-sm text-slate-300">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
}