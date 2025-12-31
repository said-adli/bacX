"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, LogOut, Radio, ChevronDown, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

// Breadcrumb mapping
const routeLabels: Record<string, string> = {
    "dashboard": "لوحة التحكم",
    "subjects": "المواد الدراسية",
    "subject": "المادة",
    "subscription": "الاشتراك",
    "profile": "الحساب",
    "video": "الدرس",
    "live": "البث المباشر",
    "admin": "الإدارة",
    "search": "البحث",
};

export function TopNav() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLiveActive, setIsLiveActive] = useState(false);

    interface Notification {
        id: string;
        title: string;
        body: string;
        read: boolean;
    }
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const profileRef = useRef<HTMLDivElement>(null);

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);
        const crumbs: { label: string; href: string }[] = [
            { label: "الرئيسية", href: "/" }
        ];

        let currentPath = "";
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const label = routeLabels[segment] || segment;
            if (index < segments.length - 1) {
                crumbs.push({ label, href: currentPath });
            } else {
                crumbs.push({ label, href: "" }); // Current page, no link
            }
        });

        return crumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Live Status
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "app_settings", "global"), (doc) => {
            setIsLiveActive(doc.data()?.isLiveActive || false);
        });
        return () => unsub();
    }, []);

    // Notifications
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "notifications"),
            where("userId", "in", [user.uid, "global"]),
            orderBy("createdAt", "desc"),
            limit(10)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.read).length);
        });
        return () => unsub();
    }, [user]);

    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Theme Logic
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <header className="w-full h-full flex items-center justify-between px-4 lg:px-6 transition-all duration-300">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                {breadcrumbs.map((crumb, index) => (
                    <span key={index} className="flex items-center">
                        {index > 0 && <ChevronDown className="w-3 h-3 mx-1 opacity-30 -rotate-90" />}
                        {crumb.href ? (
                            <Link href={crumb.href} className="hover:text-primary transition-colors hover:bg-white/5 px-2 py-1 rounded-md">
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-slate-900 dark:text-white px-2 py-1">{crumb.label}</span>
                        )}
                    </span>
                ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={theme}
                            initial={{ y: -20, opacity: 0, rotate: -90 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: 20, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            {theme === 'light' ? (
                                <Sun className="w-5 h-5 text-orange-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-blue-400" />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </button>

                {/* Search */}
                <Link
                    href="/search"
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
                >
                    <Search className="w-5 h-5" />
                </Link>

                {/* Live Indicator */}
                {isLiveActive && (
                    <Link href="/live" className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        مباشر
                    </Link>
                )}

                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black" />
                    )}
                </button>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="btn-notion btn-ghost flex items-center gap-2"
                    >
                        <div className="w-6 h-6 rounded bg-[var(--foreground)] text-white flex items-center justify-center text-xs font-medium">
                            {user?.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 mt-2 w-56 glass-panel rounded-2xl shadow-xl overflow-hidden z-50 ring-1 ring-white/10"
                            >
                                <div className="p-3 border-b border-[var(--border)]">
                                    <p className="text-sm font-medium text-[var(--foreground)]">
                                        {user?.displayName || "المستخدم"}
                                    </p>
                                    <p className="text-xs text-[var(--foreground-tertiary)] truncate">
                                        {user?.email}
                                    </p>
                                </div>
                                <div className="p-1">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="block px-3 py-2 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] rounded transition-colors"
                                    >
                                        الملف الشخصي
                                    </Link>
                                    <Link
                                        href="/subscription"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="block px-3 py-2 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] rounded transition-colors"
                                    >
                                        الاشتراك
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        تسجيل الخروج
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
