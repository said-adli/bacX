"use client";

import Link from 'next/link';
import { usePathname } from "next/navigation";
import { Home, User, Crown, Settings, ChevronDown, ChevronRight, Brain, Calculator, FlaskConical, Microscope } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { BrainyLogo } from "@/components/ui/BrainyLogo";

const mainNavItems = [
    { href: "/dashboard", label: "الرئيسية", icon: Home },
    { href: "/subscription", label: "الاشتراك", icon: Crown },
    { href: "/profile", label: "الحساب", icon: User },
];

const subjects = [
    { id: "math", label: "الرياضيات", icon: Calculator },
    { id: "physics", label: "الفيزياء", icon: FlaskConical },
    { id: "science", label: "العلوم", icon: Microscope },
    { id: "philosophy", label: "الفلسفة", icon: Brain },
];

export function Sidebar() {
    const pathname = usePathname();
    const { profile } = useAuth();

    // Default to 'student' if no profile
    const role = profile?.role || 'student';
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(true);

    return (
        <div className="w-full h-full flex flex-col bg-transparent relative z-50 pointer-events-auto">
            {/* Logo - Perfectly Centered */}
            <div className="h-24 flex items-center justify-center border-b border-white/5 mx-6">
                <Link href="/dashboard" className="group">
                    <BrainyLogo variant="navbar" className="h-12 w-auto" />
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8 scrollbar-none">
                <div className="space-y-2">
                    {mainNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    "relative flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden",
                                    isActive
                                        ? "bg-primary/10 text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {/* Active Indicator Border */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                                    />
                                )}

                                <Icon className={cn(
                                    "w-6 h-6 shrink-0 transition-colors duration-300",
                                    isActive ? "text-primary drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" : "group-hover:text-primary"
                                )} />
                                <span className={cn(
                                    "text-base font-medium tracking-wide",
                                    isActive ? "text-white" : ""
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Subjects Tree View */}
                <div>
                    <button
                        onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
                        className="w-full flex items-center justify-between px-6 py-2 text-xs font-bold uppercase tracking-widest text-white/40 mb-2 hover:text-white/60 transition-colors"
                    >
                        <span>المواد الدراسية</span>
                        {isSubjectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    <AnimatePresence>
                        {isSubjectsOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="space-y-1 overflow-hidden"
                            >
                                {subjects.map((subject) => {
                                    const Icon = subject.icon;
                                    const isActive = pathname.includes(subject.id);

                                    return (
                                        <Link
                                            key={subject.id}
                                            href={`/subject/${subject.id}`}
                                            className={cn(
                                                "relative flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group mr-4", // Indentation via margin-right
                                                isActive ? "bg-primary/5 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {isActive && (
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary/50 rounded-l-full" />
                                            )}

                                            <Icon className={cn(
                                                "w-5 h-5 shrink-0 transition-colors",
                                                isActive ? "text-primary" : "group-hover:text-primary/70"
                                            )} />
                                            <span className="text-sm font-medium">{subject.label}</span>
                                        </Link>
                                    );
                                })}

                                <Link
                                    href="/subjects"
                                    className="flex items-center gap-4 px-6 py-3 text-sm text-primary/70 hover:text-primary transition-colors mr-4"
                                >
                                    <div className="w-5 flex justify-center"><ChevronRight className="w-4 h-4" /></div>
                                    <span>عرض كل المواد...</span>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Admin Section */}
                {role === 'admin' && (
                    <div className="pt-4 border-t border-white/5 mx-4">
                        <Link
                            href="/admin"
                            prefetch={true}
                            className={cn(
                                "flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 group",
                                pathname.startsWith('/admin') ? "bg-red-500/10 text-red-500" : "text-white/60 hover:text-red-400 hover:bg-red-500/5"
                            )}
                        >
                            <Settings className="w-6 h-6 shrink-0" />
                            <span className="font-medium">لوحة التحكم</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Premium Upgrade Card - Floating Glass */}
            <div className="p-6 relative z-10">
                <Link
                    href="/subscription"
                    className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-base mb-1 group-hover:text-primary transition-colors">ترقية الحساب</h4>
                            <p className="text-xs text-white/50 leading-relaxed">افتح جميع الدروس والتمارين الآن</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
