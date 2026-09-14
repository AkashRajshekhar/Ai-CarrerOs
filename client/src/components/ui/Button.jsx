export default function Button({ children, variant = 'primary', className = '', ...props }) {
    const variants = {
        primary: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
        secondary: 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        danger: 'border border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/20',
        ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
    }

    return <button className={`rounded-xl px-4 py-2.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`} {...props}>{children}</button>
}
