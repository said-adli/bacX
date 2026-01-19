"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    Search, Bell, Settings, LogOut, User,
    ChevronDown, CreditCard, Menu
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LiveStatus from "./LiveStatus";
import { AnimatePresence, motion } from "framer-motion";

export default function StickyGlassMenu() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, profile, logout } = useAuth();

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] px-4 md:px-12 pt-6 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">

                {/* LEFT: Profile & Notifications (RTL Layout -> Actually Right on screen) */}
                {/* Note: Project is RTL, so first item in flex logic is Right Side visually if dir="rtl", 
                    but here we standardise flex order. 
                    Let's assume dir="rtl" is set on body. 
                    So: 
                    Start = Right
                    End = Left
                */}

                {/* 1. BRAND & LIVE (Right Side visually) */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative w-[50px] h-[50px]">
                            <Image
                                src="/images/brainy-logo-v2.png"
                                alt="Brainy"
                                fill
                                className="object-contain"
                                style={{ filter: "drop-shadow(0 0 12px rgba(37, 99, 235, 0.4))" }}
                            />
                        </div>
                    </div>
                    <LiveStatus />
                </div>

                {/* 2. SEARCH (Center) */}
                <div className={`hidden md:flex flex-1 max-w-md mx-6 transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
                    <div className={`relative w-full group ${isSearchFocused ? 'ring-2 ring-blue-500/20' : ''} rounded-full`}>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/30 group-focus-within:text-blue-400 transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="ابحث عن درس، مادة، أو أستاذ..."
                            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-full py-2.5 pr-10 pl-4 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all placeholder:text-white/20"
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </div>
                </div>

                {/* 3. ACTIONS (Left Side visually) */}
                <div className="flex items-center gap-3">

                    {/* Notifications */}
                    <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
                        <Bell size={18} className="text-white/70 group-hover:text-white transition-colors" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-black/50 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex items-center gap-2 pl-1 pr-1 py-1 rounded-full border transition-all ${isProfileOpen ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                                {/* Fallback Avatar if no image */}
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white">
                                    {profile?.full_name?.[0] || <User size={14} />}
                                </div>
                            </div>
                            <ChevronDown size={14} className={`text-white/50 transition-transform duration-300 ml-1 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-0 mt-2 w-56 bg-[#0B0E14]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[70]"
                                >
                                    <div className="p-4 border-b border-white/5 bg-white/5">
                                        <p className="font-bold text-sm text-white truncate">{profile?.full_name || 'طالب'}</p>
                                        <p className="text-xs text-white/50 truncate font-mono">{user?.email}</p>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <User size={16} />
                                            الملف الشخصي
                                        </Link>
                                        <Link
                                            href="/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <Settings size={16} />
                                            الإعدادات
                                        </Link>
                                        <Link
                                            href="/subscription"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <CreditCard size={16} />
                                            الاشتراك
                                        </Link>
                                    </div>
                                    <div className="p-2 border-t border-white/5">
                                        <button
                                            onClick={() => { logout(); setIsProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                                        >
                                            <LogOut size={16} />
                                            تسجيل الخروج
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}
