export default function Card({ title, action, children, className = '' }) {
    return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}><div className="mb-4 flex items-center justify-between gap-3">{title && <h2 className="text-lg font-semibold text-slate-800">{title}</h2>}{action}</div>{children}</section>
}
