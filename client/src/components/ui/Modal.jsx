import { X } from 'lucide-react'

export default function Modal({ open, title, onClose, children }) {
    if (!open) return null
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold text-slate-900">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X size={18} /></button></div><div className="mt-5 text-slate-700">{children}</div></div></div>
}
