export default function Input({ label, hint, className = '', ...props }) {
    return <label className="block text-sm text-slate-300"><span className="mb-2 block">{label}</span><input className={`w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 ${className}`} {...props} />{hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}</label>
}
