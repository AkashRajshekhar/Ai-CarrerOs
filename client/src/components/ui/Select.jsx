export default function Select({ label, options, className = '', ...props }) {
    return <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">{label}</span><select className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${className}`} {...props}>{options.map((option) => <option key={option.value || option} value={option.value || option}>{option.label || option}</option>)}</select></label>
}
