import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const defaultForm = {
    college: '',
    degree: '',
    branch: '',
    graduationYear: '',
    cgpa: '',
    careerInterests: ['Full Stack Development'],
    skills: {
        programmingLanguages: 'JavaScript',
        frameworks: 'React',
        databases: 'MongoDB',
        tools: 'Git',
    },
    experience: {
        projects: 'Portfolio website',
        internships: '',
        certifications: '',
        achievements: '',
    },
    links: {
        github: '',
        linkedin: '',
        portfolio: '',
    },
}

const careerOptions = [
    'Full Stack Development',
    'Frontend Development',
    'Backend Development',
    'AI/ML',
    'Data Science',
    'Cyber Security',
    'Cloud Computing',
    'DevOps',
    'Mobile Development',
    'Data Analytics',
]

export default function Onboarding() {
    const navigate = useNavigate()
    const [form, setForm] = useState(defaultForm)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingProfile, setLoadingProfile] = useState(true)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = localStorage.getItem('careeros-token')
                const response = await axios.get('http://localhost:5000/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const profile = response.data?.data
                if (profile) {
                    setForm((current) => ({
                        ...current,
                        ...profile,
                        graduationYear: profile.graduationYear || '',
                        cgpa: profile.cgpa || '',
                        careerInterests: profile.careerInterests?.length ? profile.careerInterests : current.careerInterests,
                        skills: Object.fromEntries(Object.entries(current.skills).map(([key, value]) => [key, profile.skills?.[key]?.join(', ') || value])),
                        experience: Object.fromEntries(Object.entries(current.experience).map(([key, value]) => [key, profile.experience?.[key]?.join(', ') || value])),
                        links: { ...current.links, ...(profile.links || {}) },
                    }))
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load your profile.')
            } finally {
                setLoadingProfile(false)
            }
        }

        loadProfile()
    }, [])

    const handleFieldChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    const handleSkillChange = (section, value) => {
        setForm((current) => ({
            ...current,
            skills: {
                ...current.skills,
                [section]: value,
            },
        }))
    }

    const handleExperienceChange = (section, value) => {
        setForm((current) => ({
            ...current,
            experience: {
                ...current.experience,
                [section]: value,
            },
        }))
    }

    const handleInterestToggle = (interest) => {
        setForm((current) => {
            const alreadySelected = current.careerInterests.includes(interest)
            return {
                ...current,
                careerInterests: alreadySelected
                    ? current.careerInterests.filter((item) => item !== interest)
                    : [...current.careerInterests, interest],
            }
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('careeros-token')
            const payload = {
                ...form,
                skills: Object.fromEntries(Object.entries(form.skills).map(([key, value]) => [key, value.split(',').map((item) => item.trim()).filter(Boolean)])),
                experience: Object.fromEntries(Object.entries(form.experience).map(([key, value]) => [key, value.split(',').map((item) => item.trim()).filter(Boolean)])),
            }
            await axios.post('http://localhost:5000/api/profile', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to save your profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
            <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Onboarding</p>
                <h1 className="mt-3 text-3xl font-semibold">Build your student profile</h1>
                <p className="mt-2 text-slate-400">Tell us about your education, interests, and technical strengths.</p>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {loadingProfile ? <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-slate-300">Loading your saved profile...</div> : <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                    <section className="grid gap-4 md:grid-cols-2">
                        <Field label="College" name="college" value={form.college} onChange={handleFieldChange} />
                        <Field label="Degree" name="degree" value={form.degree} onChange={handleFieldChange} />
                        <Field label="Branch" name="branch" value={form.branch} onChange={handleFieldChange} />
                        <Field label="Graduation Year" name="graduationYear" type="number" value={form.graduationYear} onChange={handleFieldChange} />
                        <Field label="CGPA" name="cgpa" type="number" step="0.1" value={form.cgpa} onChange={handleFieldChange} />
                    </section>

                    <section>
                        <h2 className="mb-3 text-xl font-semibold">Career Interests</h2>
                        <div className="flex flex-wrap gap-2">
                            {careerOptions.map((option) => {
                                const selected = form.careerInterests.includes(option)
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleInterestToggle(option)}
                                        className={`rounded-full border px-3 py-2 text-sm transition ${selected
                                            ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200'
                                            : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2">
                        <TextareaField
                            label="Programming Languages"
                            value={form.skills.programmingLanguages}
                            onChange={(value) => handleSkillChange('programmingLanguages', value)}
                        />
                        <TextareaField
                            label="Frameworks"
                            value={form.skills.frameworks}
                            onChange={(value) => handleSkillChange('frameworks', value)}
                        />
                        <TextareaField
                            label="Databases"
                            value={form.skills.databases}
                            onChange={(value) => handleSkillChange('databases', value)}
                        />
                        <TextareaField
                            label="Tools"
                            value={form.skills.tools}
                            onChange={(value) => handleSkillChange('tools', value)}
                        />
                    </section>

                    <section className="grid gap-4 md:grid-cols-2">
                        <TextareaField
                            label="Projects"
                            value={form.experience.projects}
                            onChange={(value) => handleExperienceChange('projects', value)}
                        />
                        <TextareaField
                            label="Internships"
                            value={form.experience.internships}
                            onChange={(value) => handleExperienceChange('internships', value)}
                        />
                        <TextareaField
                            label="Certifications"
                            value={form.experience.certifications}
                            onChange={(value) => handleExperienceChange('certifications', value)}
                        />
                        <TextareaField
                            label="Achievements"
                            value={form.experience.achievements}
                            onChange={(value) => handleExperienceChange('achievements', value)}
                        />
                    </section>

                    <section className="grid gap-4 md:grid-cols-3">
                        <Field label="GitHub" name="github" value={form.links.github} onChange={(event) => setForm((current) => ({ ...current, links: { ...current.links, github: event.target.value } }))} />
                        <Field label="LinkedIn" name="linkedin" value={form.links.linkedin} onChange={(event) => setForm((current) => ({ ...current, links: { ...current.links, linkedin: event.target.value } }))} />
                        <Field label="Portfolio" name="portfolio" value={form.links.portfolio} onChange={(event) => setForm((current) => ({ ...current, links: { ...current.links, portfolio: event.target.value } }))} />
                    </section>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? 'Saving profile...' : 'Save profile'}
                    </button>
                </form>}
            </div>
        </main>
    )
}

function Field({ label, name, value, type = 'text', onChange, step }) {
    return (
        <div>
            <label className="mb-1 block text-sm text-slate-300">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                step={step}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-400"
            />
        </div>
    )
}

function TextareaField({ label, value, onChange }) {
    return (
        <div>
            <label className="mb-1 block text-sm text-slate-300">{label}</label>
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-400"
            />
        </div>
    )
}
