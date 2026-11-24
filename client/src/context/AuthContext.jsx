import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { getApiErrorMessage } from '../utils/apiError'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
axios.defaults.withCredentials = true

const api = axios.create({
    baseURL: "https://ai-carreros-backend1.onrender.com",
    timeout: 10000,
    withCredentials: true,
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('careeros-token'))
    const [loading, setLoading] = useState(true)
    const [profileExists, setProfileExists] = useState(false)

    const checkProfile = async (jwtToken = token) => {
        if (!jwtToken) {
            setProfileExists(false)
            return false
        }

        try {
            const response = await api.get('/profile', {
                headers: { Authorization: `Bearer ${jwtToken}` },
            })
            const hasProfile = Boolean(response.data?.data)
            setProfileExists(hasProfile)
            return hasProfile
        } catch (error) {
            setProfileExists(false)
            return false
        }
    }

    useEffect(() => {
        const savedToken = localStorage.getItem('careeros-token')

        if (savedToken) api.defaults.headers.common.Authorization = `Bearer ${savedToken}`

        api
            .get('/auth/me')
            .then(async (response) => {
                setUser(response.data.user)
                setToken(savedToken || null)
                await checkProfile(savedToken || null)
            })
            .catch(() => {
                void api.post('/auth/logout').catch(() => {})
                localStorage.removeItem('careeros-token')
                delete api.defaults.headers.common.Authorization
                setUser(null)
                setToken(null)
                setProfileExists(false)
            })
            .finally(() => setLoading(false))
    }, [])

    const login = async (email, password) => {
        let response
        try {
            response = await api.post('/auth/login', { email, password })
        } catch (error) {
            error.userMessage = getApiErrorMessage(error, 'Unable to login right now.')
            throw error
        }
        const { token: newToken, user: userData } = response.data

        localStorage.setItem('careeros-token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        setToken(newToken)
        setUser(userData)
        void checkProfile(newToken)
        return response.data
    }

    const signup = async (formData) => {
        let response
        try {
            response = await api.post('/auth/signup', formData)
        } catch (error) {
            error.userMessage = getApiErrorMessage(error, 'Unable to create your account right now.')
            throw error
        }
        const { token: newToken, user: userData } = response.data

        localStorage.setItem('careeros-token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        setToken(newToken)
        setUser(userData)
        void checkProfile(newToken)
        return response.data
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } catch {
            // Clear local state even when the API is unreachable.
        } finally {
            localStorage.removeItem('careeros-token')
            delete api.defaults.headers.common.Authorization
            setToken(null)
            setUser(null)
            setProfileExists(false)
        }
    }

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            login,
            signup,
            logout,
            api,
            profileExists,
            checkProfile,
            setProfileExists,
        }),
        [user, token, loading, profileExists],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}

