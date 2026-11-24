import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'
import Button from './ui/Button'

export function LoadingState({ message = 'Loading...' }) {
    return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm"><LoaderCircle className="animate-spin text-blue-600" size={18} />{message}</div>
}

export function EmptyState({ title, message, action }) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><Inbox className="mx-auto text-slate-500" size={28} /><h2 className="mt-3 font-semibold text-slate-900">{title}</h2><p className="mt-2 text-sm text-slate-700">{message}</p>{action}</div>
}

export function ErrorState({ message, onRetry }) {
    return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 shrink-0" size={18} /><div><p>{message}</p>{onRetry && <Button variant="danger" type="button" onClick={onRetry} className="mt-3 px-3 py-2 text-sm">Try again</Button>}</div></div></div>
}
