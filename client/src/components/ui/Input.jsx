export default function Input({ label, hint, className = '', ...props }) {
    return <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">{label}</span><input className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${className}`} {...props} />{hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}</label>
}
