import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const navigation = [
    { name: 'HQ', href: '/' },
    { name: 'Enlist', href: '/registration' },
    { name: 'Fire Control', href: '/fire-control' },
    { name: 'Profile', href: '/profile' },
]

export function NavPanel() {
    const location = useLocation()

    return (
        <Disclosure as="nav" className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-[#2a3520] shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-20 items-center justify-between">

                            {/* Logo / Brand — military insignia style */}
                            <Link to="/" className="flex items-center gap-4 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full group-hover:bg-amber-500/40 transition-colors" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}></div>
                                    <div className="relative h-12 w-12 border-2 border-amber-500/80 rotate-45 flex items-center justify-center bg-black/60 group-hover:border-amber-400 group-hover:-translate-y-0.5 transition-all duration-300">
                                        <div className="absolute inset-0 border border-amber-500/30 m-1"></div>
                                        <span className="-rotate-45 text-amber-500 font-black text-xl tracking-tighter group-hover:text-amber-400 transition-colors font-sans">H</span>
                                    </div>
                                </div>
                                <div className="flex flex-col leading-none ml-2">
                                    <span className="text-amber-500/90 font-black text-xl tracking-[0.3em] uppercase group-hover:text-amber-400 transition-colors font-sans" style={{ textShadow: '0 0 10px rgba(217,119,6,0.3)' }}>
                                        Hetman
                                    </span>
                                    <span className="text-[#8a9a6a] text-[10px] tracking-[0.5em] uppercase font-mono-tactical mt-1">
                                        Tactical Ops
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex md:items-center md:gap-2">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={clsx(
                                                'relative px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 overflow-hidden group',
                                                isActive
                                                    ? 'text-amber-400'
                                                    : 'text-[#8a9a6a] hover:text-amber-500'
                                            )}
                                        >
                                            <span className="relative z-10">{item.name}</span>

                                            {/* Hover background */}
                                            <div className="absolute inset-0 bg-amber-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>

                                            {isActive && (
                                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.8)]" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>

                            {/* Right side — CTA + Hamburger */}
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/registration"
                                    className="hidden sm:inline-flex relative items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#0a0c09] bg-amber-700 hover:bg-amber-600 transition-all duration-300 shadow-[0_0_15px_rgba(217,119,6,0.2)] hover:shadow-[0_0_25px_rgba(217,119,6,0.4)] group overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Deploy
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                                        </svg>
                                    </span>
                                    {/* Glint effect */}
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-white opacity-20 group-hover:animate-glint"></div>

                                    {/* Corner accents */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                                </Link>

                                {/* Hamburger menu button */}
                                <DisclosureButton className="md:hidden inline-flex items-center justify-center p-2 text-[#8a9a6a] hover:text-amber-500 hover:bg-[#2a3520]/60 border border-transparent hover:border-[#3a4a2a] transition-all duration-200">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </DisclosureButton>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Panel — Hamburger dropdown */}
                    <Transition
                        enter="transition duration-300 ease-out"
                        enterFrom="opacity-0 -translate-y-4"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition duration-200 ease-in"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 -translate-y-4"
                    >
                        <DisclosurePanel className="md:hidden border-t border-[#2a3520] bg-black/90 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                            <div className="px-4 py-4 space-y-2">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href
                                    return (
                                        <DisclosureButton
                                            key={item.name}
                                            as={Link}
                                            to={item.href}
                                            className={clsx(
                                                'flex items-center gap-4 w-full px-4 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200 border-l-2',
                                                isActive
                                                    ? 'text-amber-400 bg-amber-500/10 border-amber-500'
                                                    : 'text-[#8a9a6a] hover:text-amber-500 hover:bg-white/5 border-transparent'
                                            )}
                                        >
                                            <span className={clsx(
                                                'w-2 h-2 rotate-45 transition-colors',
                                                isActive ? 'bg-amber-500 animate-pulse' : 'bg-[#4a5a3a]'
                                            )} />
                                            {item.name}
                                        </DisclosureButton>
                                    )
                                })}
                                <div className="pt-4 pb-2">
                                    <DisclosureButton
                                        as={Link}
                                        to="/registration"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#0a0c09] bg-amber-500 hover:bg-amber-400 transition-all duration-200"
                                    >
                                        Deploy Now
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                                        </svg>
                                    </DisclosureButton>
                                </div>
                            </div>
                        </DisclosurePanel>
                    </Transition>
                </>
            )}
        </Disclosure>
    )
}
