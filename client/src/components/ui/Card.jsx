export default function Card({ title, action, children, className = '' }) {
    return <section className={`rounded-3xl border border-white/10 bg-slate-900 p-5 ${className}`}><div className="mb-4 flex items-center justify-between gap-3">{title && <h2 className="text-lg font-semibold text-white">{title}</h2>}{action}</div>{children}</section>
}
