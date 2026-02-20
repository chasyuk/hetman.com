<<<<<<< HEAD
import { useState } from 'react'
=======
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
>>>>>>> 228d747 (add interface)
import './App.css'
import axios from 'axios'
import { useAuth } from './AuthContext'

export function Registration() {

    const auth = useAuth()
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const errorTimeout = useRef(null)

    const showError = function (err) {
        if (errorTimeout.current) clearTimeout(errorTimeout.current)
        setErrorMessage(err)
        errorTimeout.current = setTimeout(() => {
            setErrorMessage("")
        }, 6000)
    }

    const handleRegistrationPage = async (userData, endpoint) => {
        setIsLoading(true)
        try {
            if (endpoint.includes("login")) {
                const res = await axios.post(endpoint, {
                    email: userData.email,
                    password: userData.password,
                })
                auth.login(res.data)
                navigate('/profile')
            } else {
                await axios.post(endpoint, {
                    codename: userData.codename,
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                })
                auth.login({ codename: userData.codename, name: userData.name, email: userData.email })
                navigate('/profile')
            }
        } catch (error) {
            console.error("Request failed:", error)
            const msg = error.response?.data?.detail
                || error.response?.data?.message
                || error.message
                || "Communications error. Try again."
            showError("SYS_ERR: " + msg)
        } finally {
            setIsLoading(false)
        }
    }

    const [userData, setUserData] = useState({
        codename: "",
        name: "",
        email: "",
        password: ""
    })

    function changeData(e) {
        const { name, value } = e.target
        setUserData({
            ...userData,
            [name]: value
        })
    }

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const submitUser = async (e) => {
        e.preventDefault()

        const endpoint = isLogin ? '/api/login' : '/api/register'

        let isFormEmpty = false
        if (!isLogin) {
            isFormEmpty = !userData.codename?.trim() || !userData.name?.trim() || !userData.email?.trim() || !userData.password?.trim()
        } else {
            isFormEmpty = !userData.email?.trim() || !userData.password?.trim()
        }

        if (isFormEmpty) {
            showError("SYS_ERR: INCOMPLETE DATA MATRIX.")
            return
        }

        if (!isValidEmail(userData.email)) {
            showError("SYS_ERR: INVALID COMM-LINK FORMAT.")
            return
        }

        const newUser = {
            codename: userData.codename,
            name: userData.name,
            email: userData.email,
            password: userData.password
        }
        handleRegistrationPage(newUser, endpoint)
    }



    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background Map Animation */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen bg-[radial-gradient(ellipse_at_center,_var(--color-bg-base)_0%,_#000_100%)]"></div>

            <div className="w-full max-w-xl relative z-10">

                <div className="tactical-border bg-black/60 backdrop-blur-xl p-8 sm:p-12 shadow-2xl border border-[#2a3520]">

                    {/* Header */}
                    <div className="text-center space-y-4 mb-8">
                        <div className="flex justify-center items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-amber-500 animate-pulse"></span>
                            <span className="w-8 h-[1px] bg-amber-500/50"></span>
                            <span className="w-2 h-2 bg-amber-500 animate-pulse"></span>
                        </div>
                        <span className="block text-xs font-mono-tactical tracking-[0.5em] text-amber-500/60">
                            {isLogin ? 'AUTH_PROTOCOL_INIT' : 'RECRUITMENT_PROTOCOL_INIT'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-[#e2e8f0]" style={{ filter: 'drop-shadow(0 0 10px rgba(217,119,6,0.2))' }}>
                            {isLogin ? 'Identity Verify' : 'Operator Enlist'}
                        </h2>
                        <p className="text-xs font-mono-tactical text-[#8a9a6a] tracking-widest">
                            {isLogin ? '> ENTER SECURITY CREDENTIALS_' : '> INITIALISE OPERATOR PROFILE_'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submitUser} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-6">
                                {/* Codename */}
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[10px] font-mono-tactical tracking-[0.4em] text-[#6b7a55] group-focus-within:text-amber-500/80 transition-colors">
                                        <span className="w-1 h-1 bg-current"></span> Callsign
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="codename"
                                            type="text"
                                            onChange={changeData}
                                            placeholder="GHOST-01..."
                                            value={userData.codename}
                                            className="w-full px-4 py-3 bg-[#0a0c09]/80 border-b-2 border-[#2a3520] text-white font-mono-tactical text-sm tracking-widest placeholder-[#4a5a3a] focus:border-amber-500 focus:outline-none focus:bg-[#141a10] transition-all duration-300"
                                        />
                                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-500 group-focus-within:w-full"></div>
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[10px] font-mono-tactical tracking-[0.4em] text-[#6b7a55] group-focus-within:text-amber-500/80 transition-colors">
                                        <span className="w-1 h-1 bg-current"></span> Full Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="name"
                                            type="text"
                                            onChange={changeData}
                                            placeholder="John Doe..."
                                            value={userData.name}
                                            className="w-full px-4 py-3 bg-[#0a0c09]/80 border-b-2 border-[#2a3520] text-white font-mono-tactical text-sm tracking-widest placeholder-[#4a5a3a] focus:border-amber-500 focus:outline-none focus:bg-[#141a10] transition-all duration-300"
                                        />
                                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-500 group-focus-within:w-full"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2 group">
                            <label className="flex items-center gap-2 text-[10px] font-mono-tactical tracking-[0.4em] text-[#6b7a55] group-focus-within:text-amber-500/80 transition-colors">
                                <span className="w-1 h-1 bg-current"></span> Secure Comm-Link
                            </label>
                            <div className="relative">
                                <input
                                    name="email"
                                    type="email"
                                    onChange={changeData}
                                    placeholder="operator@command.mil..."
                                    value={userData.email}
                                    required
                                    className="w-full px-4 py-3 bg-[#0a0c09]/80 border-b-2 border-[#2a3520] text-white font-mono-tactical text-sm tracking-widest placeholder-[#4a5a3a] focus:border-amber-500 focus:outline-none focus:bg-[#141a10] transition-all duration-300"
                                />
                                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2 group">
                            <label className="flex items-center gap-2 text-[10px] font-mono-tactical tracking-[0.4em] text-[#6b7a55] group-focus-within:text-amber-500/80 transition-colors">
                                <span className="w-1 h-1 bg-current"></span> Encryption Key
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type="password"
                                    onChange={changeData}
                                    placeholder="••••••••••••"
                                    value={userData.password}
                                    className="w-full px-4 py-3 bg-[#0a0c09]/80 border-b-2 border-[#2a3520] text-white font-mono-tactical text-sm tracking-widest placeholder-[#4a5a3a] focus:border-amber-500 focus:outline-none focus:bg-[#141a10] transition-all duration-300"
                                />
                                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-500 group-focus-within:w-full"></div>
                            </div>
                        </div>

                        {/* Error message Terminal style */}
                        {errorMessage && (
                            <div className="relative bg-red-950/40 border border-red-500/50 p-4 overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/50 animate-[scanline_2s_linear_infinite]"></div>
                                <div className="flex items-start gap-3 text-red-400 font-mono-tactical text-xs tracking-widest leading-relaxed">
                                    <span className="animate-pulse">▶</span>
                                    <span>{errorMessage}</span>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative group w-full py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#0a0c09] bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_35px_rgba(217,119,6,0.5)] overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 group-active:scale-95 transition-transform">
                                {isLoading ? (
                                    <>Processing <span className="animate-pulse">...</span></>
                                ) : (
                                    <>{isLogin ? 'TRANSMIT AUTH' : 'SUBMIT DOSSIER'} <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg></>
                                )}
                            </span>
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-white opacity-20 group-hover:animate-glint"></div>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#3a4a2a]" />
                        <span className="text-[10px] font-mono-tactical tracking-[0.5em] text-[#4a5a3a]">SYS_LINK</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#3a4a2a]" />
                    </div>

                    {/* Toggle login/register */}
                    <div className="mt-6 text-center">
                        <p className="text-xs font-mono-tactical text-[#6b7a55] tracking-widest uppercase flex flex-col sm:flex-row items-center justify-center gap-2">
                            <span>{isLogin ? "No active profile? " : "Already verified? "}</span>
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-amber-500/80 hover:text-amber-400 font-bold uppercase tracking-widest transition-all duration-300 bg-transparent border-b border-amber-500/30 hover:border-amber-400 cursor-pointer pb-0.5"
                            >
                                {isLogin ? "Initiate Enlistment" : "Login Sequence"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
