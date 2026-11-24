import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <p>Loading your workspace...</p>
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (roles && !roles.includes(user.role)) {
        const homeRoute = user.role === 'recruiter' ? '/recruiter' : user.role === 'admin' ? '/admin' : '/dashboard'
        return <Navigate to={homeRoute} replace />
    }

    return children
}
