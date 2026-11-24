export default function ProgressBar({ value = 0, label, className = '' }) {
    const safeValue = Math.min(100, Math.max(0, Number(value) || 0))
    return <div className={className}>{label && <div className="mb-2 flex justify-between text-sm text-slate-700"><span>{label}</span><span>{safeValue}%</span></div>}<div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${safeValue}%` }} /></div></div>
}
