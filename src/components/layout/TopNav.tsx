"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, LogOut, ChevronDown, X, BookOpen, Crown, User as UserIcon } from "lucide-react";



import { Link } from 'next-view-transitions';
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BrainyLogo } from "@/components/ui/BrainyLogo";

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

interface Notification {
    id: string;
    title: string;
    body: string;
    read: boolean;
}

export function TopNav() {
    const { user, userProfile, logout } = useAuth();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLiveActive, setIsLiveActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

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

    // Mock Search Results (Replace with Algolia/Fuse.js/Firestore later)
    const mockSearchResults = [
        { id: 1, title: "الدوال الأسية - الدرس الأول", type: "lesson" },
        { id: 2, title: "ملخص الوحدة الأولى - فيزياء", type: "summary" },
        { id: 3, title: "تمرين شامل في الأعداد المركبة", type: "exercise" },
    ].filter(item => item.title.includes(searchQuery));

    return (
        <header className="relative w-full h-full flex items-center justify-between px-4 lg:px-8 bg-transparent">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-400">
                <div className="lg:hidden ml-2">
                    <Link href="/">
                        <BrainyLogo variant="icon" className="w-10 h-10" />
                    </Link>
                </div>
                {breadcrumbs.map((crumb, index) => (
                    <span key={index} className="flex items-center">
                        {index > 0 && <ChevronDown className="w-3 h-3 mx-2 opacity-30 -rotate-90" />}
                        {crumb.href ? (
                            <Link href={crumb.href} className="hover:text-primary transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-white px-2 py-1">{crumb.label}</span>
                        )}
                    </span>
                ))}
            </nav>

            {/* Actions Area */}
            <div className="flex items-center gap-4">

                {/* Live Indicator */}
                {isLiveActive && (
                    <Link href="/live" className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-full transition-colors border border-red-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        مباشر
                    </Link>
                )}

                {/* Inline Search Trigger */}
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2.5 rounded-full text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                >
                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2.5 rounded-full text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                    >
                        <Bell className={cn("w-5 h-5 transition-transform", isNotificationsOpen && "text-primary")} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#0A0A0F] shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute left-0 mt-4 w-80 glass-panel rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/10"
                            >
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm">الإشعارات</h3>
                                    {unreadCount > 0 && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} جديد</span>}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className={cn("p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer", !notif.read && "bg-primary/5")}>
                                                <p className="text-sm font-medium text-white mb-1">{notif.title}</p>
                                                <p className="text-xs text-slate-400 line-clamp-2">{notif.body}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 text-sm">
                                            لا توجد إشعارات حالياً
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* Profile User Avatar */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-1 pr-1 py-1 rounded-full hover:bg-white/5 transition-all group"
                    >
                        {/* Avatar */}
                        <div className={cn(
                            "w-9 h-9 rounded-full relative flex items-center justify-center overflow-hidden ring-2 transition-all shadow-lg",
                            isProfileOpen ? "ring-primary shadow-primary/20" : "ring-white/10 group-hover:ring-white/30"
                        )}>
                            {user?.photoURL ? (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={user.photoURL}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center">
                                    <span className="text-sm font-bold text-primary">{user?.displayName?.[0]?.toUpperCase() || "B"}</span>
                                </div>
                            )}
                        </div>

                        {/* Dropdown Arrow */}
                        <ChevronDown className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-300",
                            isProfileOpen ? "rotate-180 text-primary" : "group-hover:text-white"
                        )} />
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute left-0 mt-4 w-60 glass-panel rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/10"
                            >
                                <div className="p-4 border-b border-white/5 bg-white/5">
                                    <p className="font-bold text-white truncate">{user?.displayName || "الطالب"}</p>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/20 uppercase tracking-wider">
                                            {userProfile?.role === 'admin' ? 'Admin' : (userProfile?.subscriptionStatus === 'premium' ? 'Premium' : 'Free')}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-2 space-y-1">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        الملف الشخصي
                                    </Link>
                                    <Link
                                        href="/subscription"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        <Crown className="w-4 h-4 text-amber-500" />
                                        الاشتراك
                                    </Link>
                                    <div className="h-px bg-white/5 mx-2 my-1" />
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
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

            {/* Inline Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSearchOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-0 left-0 right-0 h-24 bg-[#0A0A0F] z-[70] border-b border-white/10 flex items-center px-4 md:px-32 shadow-2xl"
                        >
                            <Search className="w-6 h-6 text-primary shrink-0 ml-4" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="ابحث عن درس، وحدة، أو تمرين..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none text-xl text-white placeholder-slate-500 focus:ring-0 px-0 h-full font-medium"
                            />
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors mr-4"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Instant Results Dropdown (Example) */}
                            {searchQuery && (
                                <div className="absolute top-full left-0 right-0 mx-4 md:mx-32 bg-[#0A0A0F] border border-white/10 border-t-0 rounded-b-2xl shadow-xl overflow-hidden">
                                    {mockSearchResults.length > 0 ? (
                                        <div className="p-2">
                                            {mockSearchResults.map(res => (
                                                <Link href={`/video/${res.id}`} key={res.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20">
                                                        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{res.title}</p>
                                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{res.type}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500">
                                            لا توجد نتائج مطابقة لـ &quot;{searchQuery}&quot;
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
