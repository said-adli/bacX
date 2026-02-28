"use client";
import React from "react";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, LogOut, User, Settings, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LiveStatus from "@/components/dashboard/LiveStatus";
import { signOutAction } from '@/actions/auth';
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { AnimatePresence, motion } from "framer-motion";
import { UserAvatar } from "@/components/ui/UserAvatar";

const StickyGlassMenuComponent = function StickyGlassMenu() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, profile, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, clearAll, pushNotification, loading, error } = useNotifications();

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] px-4 md:px-12 pt-6 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">

                {/* 1. LIVE STATUS (Right Side visually) - Logo removed, now in Sidebar */}
                <div className="flex items-center gap-4">
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
                            defaultValue={searchParams.get('q') || ''}
                            onChange={(e) => {
                                const params = new URLSearchParams(searchParams);
                                if (e.target.value) {
                                    params.set('q', e.target.value);
                                } else {
                                    params.delete('q');
                                }
                                router.replace(`${pathname}?${params.toString()}`);
                            }}
                        />
                    </div>
                </div>

                {/* 3. ACTIONS (Left Side visually) */}
                <div className="flex items-center gap-3">

                    {/* Notifications */}
                    <div className="relative" ref={notifDropdownRef}>
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                            <Bell size={18} className="text-white/70 group-hover:text-white transition-colors" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-black/50 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute left-0 mt-2 w-80 bg-[#0B0E14]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden gpu-accelerated"
                                >
                                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                                        <h3 className="font-bold text-white text-sm">الإشعارات {unreadCount > 0 && `(${unreadCount})`}</h3>
                                        <button onClick={clearAll} className="text-xs text-blue-400 hover:text-blue-300">مسح الكل</button>
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                                        {error ? (
                                            <div className="text-center py-8 text-red-400/80 text-xs">لا توجد إشعارات حالياً</div>
                                        ) : loading ? (
                                            <div className="text-center py-8 text-white/30 text-xs flex justify-center items-center gap-2">
                                                <Loader2 size={14} className="animate-spin" /> جاري التحميل...
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="text-center py-8 text-white/30 text-xs">لا توجد إشعارات جديدة</div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => markAsRead(notif.id)}
                                                    className={`p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${(notif.user_notifications?.length ?? 0) > 0 ? 'opacity-50' : 'bg-white/[0.02]'}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.type === 'live' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
                                                        <div>
                                                            <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                                                            <p className="text-xs text-white/60 mt-1">{notif.message}</p>
                                                            <span className="text-[10px] text-white/20 mt-2 block">{new Date(notif.created_at).toLocaleTimeString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex items-center gap-2 pl-1 pr-1 py-1 rounded-full border transition-all ${isProfileOpen ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-[0_0_15px_rgba(37,99,235,0.6)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.8)] transition-all duration-300">
                                <UserAvatar src={undefined} fallback={profile?.full_name} size="sm" />
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
                                    className="absolute left-0 mt-2 w-64 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[70] ring-1 ring-white/5 gpu-accelerated"
                                >
                                    <div className="p-5 border-b border-white/5 bg-white/5 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-600/10 blur-xl opacity-50" />
                                        <div className="relative z-10">
                                            <p className="font-bold text-base text-white truncate">{profile?.full_name || 'طالب'}</p>
                                            <p className="text-xs text-blue-200/50 truncate font-mono mt-0.5">{user?.email}</p>
                                        </div>
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
                                        <form action={signOutAction} className="w-full">
                                            <button
                                                type="submit"
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                                            >
                                                <LogOut size={16} />
                                                تسجيل الخروج
                                            </button>
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default React.memo(StickyGlassMenuComponent);
