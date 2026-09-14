import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'
import Button from './ui/Button'

export function LoadingState({ message = 'Loading...' }) {
    return <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900 p-6 text-slate-300"><LoaderCircle className="animate-spin text-cyan-300" size={18} />{message}</div>
}

export function EmptyState({ title, message, action }) {
    return <div className="rounded-3xl border border-dashed border-white/15 bg-slate-900/70 p-8 text-center"><Inbox className="mx-auto text-slate-500" size={28} /><h2 className="mt-3 font-semibold text-slate-200">{title}</h2><p className="mt-2 text-sm text-slate-400">{message}</p>{action}</div>
}

export function ErrorState({ message, onRetry }) {
    return <div className="rounded-3xl border border-red-400/30 bg-red-400/10 p-6 text-red-200"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 shrink-0" size={18} /><div><p>{message}</p>{onRetry && <Button variant="danger" type="button" onClick={onRetry} className="mt-3 px-3 py-2 text-sm">Try again</Button>}</div></div></div>
}
