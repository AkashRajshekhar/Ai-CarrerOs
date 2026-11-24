export default function Badge({ children, tone = 'neutral' }) {
    const tones = { neutral: 'border-slate-200 bg-slate-50 text-slate-700', info: 'border-blue-200 bg-blue-50 text-blue-700', success: 'border-green-200 bg-green-50 text-green-800', warning: 'border-amber-200 bg-amber-50 text-amber-800', danger: 'border-red-200 bg-red-50 text-red-700' }
    return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
