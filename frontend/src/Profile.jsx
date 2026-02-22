import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { ScrollReveal } from './ScrollReveal'

export function Profile() {
    const { user, isLoggedIn, logout, setAvatar } = useAuth()
    const fileInputRef = useRef(null)

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('SYS_ERR: FILE EXCEEDS MAX_SIZE MATRIX (5MB)')
                return
            }
            const reader = new FileReader()
            reader.onload = (ev) => {
                setAvatar(ev.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_#991b1b_0%,_#000_100%)] mix-blend-screen pointer-events-none"></div>
                <ScrollReveal scale={0.92} distance={0} duration={0.5} className="w-full max-w-md relative z-10">
                    <div className="border border-red-500/30 bg-black/60 backdrop-blur-xl p-10 text-center space-y-8 shadow-[0_0_50px_rgba(153,27,27,0.3)] tactical-border relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/50 animate-[scanline_3s_linear_infinite]"></div>

                        <div className="w-16 h-[2px] bg-red-500 mx-auto" style={{ filter: 'drop-shadow(0 0 10px red)' }} />
                        <div className="space-y-4">
                            <span className="inline-block border border-red-500/60 bg-red-900/30 px-4 py-1 text-[11px] font-mono-tactical tracking-[0.5em] text-red-500 animate-pulse">
                                RESTRICTED_AREA
                            </span>
                            <h1 className="text-2xl font-black uppercase tracking-widest text-red-400" style={{ textShadow: '0 0 15px rgba(248,113,113,0.5)' }}>
                                Authorization Required
                            </h1>
                            <p className="text-xs font-mono-tactical text-[#8a9a6a] tracking-widest uppercase leading-relaxed">
                                &gt; IDENTITY MATRIX NOT FOUND.<br />&gt; PLEASE INITIATE LOGIN SEQUENCE.
                            </p>
                        </div>

                        <Link
                            to="/registration"
                            className="inline-flex relative group items-center justify-center gap-2 w-full py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#0a0c09] bg-red-600 hover:bg-red-500 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] overflow-hidden"
                        >
                            <span className="relative z-10">Initiate Login <span className="ml-2">→</span></span>
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-white opacity-20 group-hover:animate-glint"></div>
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        )
    }

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background Grid & Scanline */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(var(--color-muted)_1px,_transparent_1px),_linear-gradient(90deg,_var(--color-muted)_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
            <div className="scanline-overlay"></div>
            <div className="noise-overlay"></div>

            <ScrollReveal direction="up" distance={30} duration={0.7} className="w-full max-w-2xl relative z-10 gap-8 flex flex-col items-center">

                {/* Header Widget */}
                <div className="tactical-border w-full border border-[#2a3520] bg-black/50 backdrop-blur-xl p-6 shadow-2xl flex items-center justify-between">
                    <div>
                        <span className="block text-[10px] font-mono-tactical tracking-[0.5em] text-emerald-500/70 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            CLEARANCE_GRANTED
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-[#e2e8f0]" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1))' }}>
                            Operator Dossier
                        </h2>
                    </div>
                    <div className="hidden sm:block text-right">
                        <div className="text-[10px] font-mono-tactical tracking-[0.3em] text-[#6b7a55]">SYS_TIME</div>
                        <div className="text-sm font-mono-tactical tracking-widest text-amber-500">{new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
                    </div>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-6">

                    {/* Avatar Column */}
                    <ScrollReveal direction="right" distance={25} duration={0.6} delay={0.15} className="tactical-border border border-[#2a3520] bg-black/50 backdrop-blur-xl p-6 flex flex-col items-center gap-6 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>

                        {/* Image Frame */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-40 h-40 group/avatar cursor-pointer"
                        >
                            {/* Scanning laser effect */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500 opacity-0 group-hover/avatar:opacity-100 group-hover/avatar:animate-[scanline_2s_ease-in-out_infinite] z-20 shadow-[0_0_10px_#d97706]"></div>

                            <div className="absolute inset-0 border border-[#3a4a2a] bg-[#0a0c09] overflow-hidden group-hover/avatar:border-amber-500/60 transition-colors z-10 relative">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="Profile"
                                        className="w-full h-full object-cover filter grayscale group-hover/avatar:grayscale-0 transition-all duration-500 opacity-80 group-hover/avatar:opacity-100"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#111610]">
                                        <svg className="w-8 h-8 text-[#3a4a2a] group-hover/avatar:text-amber-500/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-[10px] font-mono-tactical text-[#3a4a2a] group-hover/avatar:text-amber-500/40">NO_IMG</span>
                                    </div>
                                )}
                            </div>

                            {/* Target reticle corners */}
                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/80 transition-transform group-hover/avatar:translate-x-1 group-hover/avatar:translate-y-1 z-30"></div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/80 transition-transform group-hover/avatar:-translate-x-1 group-hover/avatar:translate-y-1 z-30"></div>
                            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/80 transition-transform group-hover/avatar:translate-x-1 group-hover/avatar:-translate-y-1 z-30"></div>
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/80 transition-transform group-hover/avatar:-translate-x-1 group-hover/avatar:-translate-y-1 z-30"></div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />

                        <div className="text-center w-full">
                            <span className="block text-xl font-bold uppercase tracking-widest text-[#e2e8f0] mb-1">
                                {user.codename || user.name || 'UNKNOWN'}
                            </span>
                            <span className="block text-[10px] font-mono-tactical tracking-[0.4em] text-emerald-500">
                                STS: ACTIVE
                            </span>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-4 w-full py-2 border border-[#3a4a2a] text-[10px] font-mono-tactical tracking-[0.3em] text-[#8a9a6a] hover:bg-amber-500 hover:text-[#0a0c09] hover:border-amber-500 transition-all cursor-pointer bg-[#0a0c09]"
                            >
                                {user.avatar ? 'UPDATE_VISUAL' : 'INIT_VISUAL'}
                            </button>
                        </div>
                    </ScrollReveal>

                    {/* Info Column */}
                    <ScrollReveal direction="left" distance={25} duration={0.6} delay={0.3} className="tactical-border border border-[#2a3520] bg-black/50 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
                        <div className="space-y-6 flex-grow">

                            <div className="group border-b border-[#2a3520] pb-2">
                                <span className="block text-[10px] font-mono-tactical tracking-[0.4em] text-[#6b7a55] mb-1">CALLSIGN_</span>
                                <span className="block text-lg font-mono-tactical tracking-widest text-[#e2e8f0] group-hover:text-amber-500 transition-colors">
                                    {user.codename || '—'}
                                </span>
                            </div>

                            <div className="group border-b border-[#2a3520] pb-2">
                                <span className="block text-[10px] font-mono-tactical tracking-[0.4em] text-[#6b7a55] mb-1">DESIGNATION_</span>
                                <span className="block text-lg font-mono-tactical tracking-widest text-[#e2e8f0] group-hover:text-amber-500 transition-colors">
                                    {user.name || '—'}
                                </span>
                            </div>

                            <div className="group border-b border-[#2a3520] pb-2">
                                <span className="block text-[10px] font-mono-tactical tracking-[0.4em] text-[#6b7a55] mb-1">COMM-LINK_</span>
                                <span className="block text-lg font-mono-tactical tracking-widest text-[#e2e8f0] group-hover:text-amber-500 transition-colors">
                                    {user.email}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="p-3 border border-[#2a3520] bg-[#111610]/50 text-center">
                                    <span className="block text-[10px] font-mono-tactical tracking-[0.3em] text-[#6b7a55]">RANK</span>
                                    <span className="block font-bold text-amber-500 mt-1">OPERATOR</span>
                                </div>
                                <div className="p-3 border border-[#2a3520] bg-[#111610]/50 text-center">
                                    <span className="block text-[10px] font-mono-tactical tracking-[0.3em] text-[#6b7a55]">CLEARANCE</span>
                                    <span className="block font-bold text-amber-500 mt-1">LEVEL_1</span>
                                </div>
                            </div>
                        </div>

                        {/* Logout / Disengage */}
                        <div className="mt-8 pt-6 border-t border-[#3a4a2a] flex justify-end">
                            <button
                                onClick={logout}
                                className="relative group px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#e2e8f0] bg-[#991b1b] hover:bg-red-500 transition-colors shadow-[0_0_10px_rgba(153,27,27,0.5)] hover:shadow-[0_0_20px_rgba(248,113,113,0.6)] flex items-center gap-2 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Subrun Disengage
                                </span>
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-white opacity-20 group-hover:animate-[glint_0.5s_ease-in-out]"></div>
                            </button>
                        </div>
                    </ScrollReveal>
                </div>
            </ScrollReveal>
        </div>
    )
}
