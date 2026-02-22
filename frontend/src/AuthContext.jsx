import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    const login = (userData) => {
        setUser({ ...userData, avatar: null })
    }

    const logout = () => {
        setUser(null)
    }

    const setAvatar = (avatarUrl) => {
        setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, setAvatar, isLoggedIn: !!user }}>
            {children}
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
