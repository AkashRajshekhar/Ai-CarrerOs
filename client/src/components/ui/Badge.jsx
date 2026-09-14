export default function Badge({ children, tone = 'neutral' }) {
    const tones = { neutral: 'border-white/10 bg-white/5 text-slate-300', info: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200', success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200', warning: 'border-amber-400/20 bg-amber-400/10 text-amber-200', danger: 'border-red-400/20 bg-red-400/10 text-red-200' }
    return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
