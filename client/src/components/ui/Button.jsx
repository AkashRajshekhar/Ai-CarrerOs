export default function Button({ children, variant = 'primary', className = '', ...props }) {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'border border-slate-200 bg-white text-slate-900 hover:border-blue-200 hover:bg-blue-50',
        danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
        ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    }

    return <button className={`rounded-xl px-4 py-2.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`} {...props}>{children}</button>
}
