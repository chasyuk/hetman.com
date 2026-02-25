import './App.css'
import { Routes, Route } from 'react-router-dom'
import { NavPanel } from './navigationPanel'
import { Registration } from './Registration'
import { Profile } from './Profile'
import { FireControl } from './FireControl'
import { AuthProvider } from './AuthContext'
import { ScrollReveal } from './ScrollReveal'

function Home() {
    return (
        <div className="min-h-screen relative">
            {/* Global effects */}
            <div className="scanline-overlay"></div>
            <div className="scanline-sweep"></div>
            <div className="noise-overlay"></div>

            {/* ─── HERO SECTION ─── */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'linear-gradient(var(--color-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-muted) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        animation: 'map-pan 60s linear infinite'
                    }}
                />

                {/* Radial intense glow behind title */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

                <ScrollReveal duration={1.0} distance={50} delay={0.15} className="relative text-center space-y-10 max-w-4xl px-6 z-10">
                    {/* Classified badge */}
                    <div className="inline-block mb-2 animate-pulse">
                        <span className="text-xs font-bold uppercase tracking-[0.5em] text-amber-500/80 border border-amber-500/30 px-6 py-2 bg-amber-900/20 backdrop-blur-sm tactical-border">
                            ◆ Top Secret // Classified ◆
                        </span>
                    </div>

                    {/* Title with glitch effect */}
                    <div className="relative inline-block">
                        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(217,119,6,0.3))' }}
                            data-text="HETMAN">
                            HETMAN
                        </h1>
                    </div>

                    {/* Decorative line */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-amber-500/80" />
                        <div className="w-3 h-3 rotate-45 border border-amber-500 bg-amber-900/50" style={{ animation: 'pulse-glow 3s infinite' }} />
                        <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-amber-500/80" />
                    </div>

                    <p className="text-base sm:text-lg text-[#8a9a6a] leading-relaxed tracking-widest uppercase max-w-2xl mx-auto font-mono-tactical">
                        Advanced Ballistic Trajectory Simulator
                        <br />
                        <span className="text-amber-500/60 text-sm">Real-World Terrain Integration Active</span>
                    </p>

                    {/* CTA buttons */}
                    <div className="flex items-center justify-center gap-6 pt-6">
                        <a
                            href="/registration"
                            className="relative group inline-flex items-center justify-center px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#0a0c09] bg-amber-500 transition-all duration-300 shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:shadow-[0_0_40px_rgba(217,119,6,0.6)] hover:bg-amber-400 overflow-hidden tactical-border"
                        >
                            <span className="relative z-10 flex items-center gap-2">Deploy Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg></span>
                            <div className="absolute inset-0 h-full w-full group-hover:bg-white/20 transition-colors"></div>
                        </a>
                        <a
                            href="/fire-control"
                            className="inline-flex items-center justify-center px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-500/80 border border-[#3a4a2a] hover:border-amber-500/60 hover:text-amber-400 transition-all duration-300 bg-[#141a10]/50 backdrop-blur-sm tactical-border"
                        >
                            Fire Control
                        </a>
                    </div>
                </ScrollReveal>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ animation: 'bounce 2s infinite' }}>
                    <span className="text-[10px] font-mono-tactical tracking-[0.4em] text-[#4a5a3a]">SYS.SCROLL</span>
                    <div className="w-px h-8 bg-gradient-to-b from-amber-500/50 to-transparent"></div>
                </div>
            </section>

            {/* ─── STATS BAR ─── */}
            <ScrollReveal direction="up" distance={25} duration={0.7} className="relative z-10 border-y border-[#2a3520] bg-black/40 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8 divide-x divide-[#2a3520]/60">
                    {[
                        { value: '360°', label: 'Firing Arc' },
                        { value: '50km', label: 'Max Range' },
                        { value: 'Real', label: 'Terrain Data' },
                        { value: 'Live', label: 'Simulation' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center space-y-2 group">
                            <div className="text-3xl sm:text-4xl font-black text-amber-500/90 tracking-widest font-mono-tactical group-hover:text-amber-400 transition-colors" style={{ textShadow: '0 0 15px rgba(217,119,6,0.2)' }}>
                                {stat.value}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#6b7a55] group-hover:text-[#8a9a6a] transition-colors">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </ScrollReveal>

            {/* ─── FEATURES SECTION ─── */}
            <section className="relative py-24 px-6 z-10 bg-gradient-to-b from-[#0a0c09] to-[#111610]">
                <div className="max-w-6xl mx-auto space-y-16">
                    {/* Section header */}
                    <ScrollReveal distance={20} duration={0.6} className="text-center space-y-4">
                        <span className="inline-block px-4 py-1 border border-[#3a4a2a] text-[11px] font-mono-tactical tracking-[0.5em] text-amber-500/60 bg-[#141a10]/50 backdrop-blur-sm">
                            SYSTEMS_OVERVIEW
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-[#e2e8f0]">
                            Core Capabilities
                        </h2>
                    </ScrollReveal>

                    {/* Feature cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                    </svg>
                                ),
                                title: 'Trajectory Engine',
                                desc: 'Physics-based ballistic calculations with wind, gravity, and drag coefficients factored in real-time.'
                            },
                            {
                                icon: (
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                                    </svg>
                                ),
                                title: 'Real-World Maps',
                                desc: 'Terrain elevation data integrated seamlessly with high-resolution satellite imagery.'
                            },
                            {
                                icon: (
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                                        <path strokeLinecap="square" strokeLinejoin="miter" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                ),
                                title: 'Live Simulation',
                                desc: 'Real-time trajectory visualization, instantaneous impact prediction, and area analysis.'
                            },
                        ].map((feature, i) => (
                            <ScrollReveal key={feature.title} delay={0.12 * i} distance={30} duration={0.6}
                                className="relative group p-8 space-y-6 bg-black/40 backdrop-blur-md border border-[#2a3520] hover:border-amber-500/50 hover:bg-[#141a10]/80 transition-all duration-500 tactical-border">

                                <div className="text-amber-500/60 group-hover:text-amber-400 group-hover:-translate-y-1 transition-all duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-base font-bold uppercase tracking-widest text-[#e2e8f0] group-hover:text-amber-500 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm font-mono-tactical text-[#8a9a6a] leading-relaxed tracking-wide group-hover:text-[#e2e8f0]/80 transition-colors">
                                    {feature.desc}
                                </p>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── BOTTOM CTA ─── */}
            <ScrollReveal scale={0.97} duration={0.7} delay={0.05} className="relative z-10 border-t border-[#2a3520] py-20 px-6 bg-[#0a0c09] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent pointer-events-none"></div>
                <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-[1px] bg-amber-500/50" />
                        <div className="w-2 h-2 rotate-45 border border-amber-500 bg-black" />
                        <div className="w-12 h-[1px] bg-amber-500/50" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-[#e2e8f0]" style={{ filter: 'drop-shadow(0 0 10px rgba(217,119,6,0.2))' }}>
                        Ready for Deployment?
                    </h2>
                    <p className="text-sm font-mono-tactical text-[#8a9a6a] tracking-widest">
                        ESTABLISH SECURE LINK TO COMMAND CENTER
                    </p>
                    <a
                        href="/registration"
                        className="inline-flex items-center gap-3 px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#0a0c09] bg-amber-500 hover:bg-amber-400 transition-all duration-300 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_40px_rgba(217,119,6,0.5)] tactical-border"
                    >
                        Begin Mission <span className="text-lg leading-none">→</span>
                    </a>
                </div>
            </ScrollReveal>
        </div>
    )
}



function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-main)] font-[Rajdhani]">
                <NavPanel />
                <main className="pt-20">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/registration" element={<Registration />} />
                        <Route path="/fire-control" element={<FireControl />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </main>
            </div>
        </AuthProvider>
    )
}

export default App
