export default function Select({ label, options, className = '', ...props }) {
    return <label className="block text-sm text-slate-300"><span className="mb-2 block">{label}</span><select className={`w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-cyan-400 ${className}`} {...props}>{options.map((option) => <option key={option.value || option} value={option.value || option}>{option.label || option}</option>)}</select></label>
}
