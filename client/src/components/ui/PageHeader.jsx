import Button from './Button'

export default function PageHeader({ eyebrow, title, description, onBack }) {
    return <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-semibold text-blue-700">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>{description && <p className="mt-2 text-slate-700">{description}</p>}</div>{onBack && <Button variant="secondary" type="button" onClick={onBack}>Back to dashboard</Button>}</header>
}
