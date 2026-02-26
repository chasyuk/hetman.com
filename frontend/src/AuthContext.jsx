import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (token) {
            axios.get('/api/me', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    setUser({ ...res.data, avatar: null })
                })
                .catch(() => {
                    // Token expired or invalid — silently clear session
                    setToken(null)
                    localStorage.removeItem('token')
                    setUser(null)
                })
                .finally(() => setIsLoading(false))
        } else {
            setIsLoading(false)
        }
    }, [token])

    const login = (userData, accessToken) => {
        setToken(accessToken)
        localStorage.setItem('token', accessToken)
        setUser({ ...userData, avatar: null })
    }

    const logout = () => {
        setToken(null)
        localStorage.removeItem('token')
        setUser(null)
    }

    const setAvatar = (avatarUrl) => {
        setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, setAvatar, isLoggedIn: !!user }}>
            {!isLoading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
