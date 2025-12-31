"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, Crown, Settings, ChevronDown, ChevronRight, Brain, Calculator, FlaskConical, Microscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const mainNavItems = [
    { href: "/dashboard", label: "الرئيسية", icon: Home },
    { href: "/subscription", label: "الاشتراك", icon: Crown },
    { href: "/profile", label: "الحساب", icon: User },
];

const subjects = [
    { id: "math", label: "الرياضيات", icon: Calculator },
    { id: "physics", label: "الفيزياء", icon: FlaskConical },
    { id: "science", label: "العلوم الطبيعية", icon: Microscope },
];

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useAuth();
    const [subjectsExpanded, setSubjectsExpanded] = useState(true);

    return (
        <div className="w-full h-full flex flex-col bg-transparent">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-white/5 mx-2">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dim rounded-xl flex items-center justify-center shadow-lg shadow-gold/10 group-hover:scale-105 transition-transform duration-300">
                        <Brain className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-wide">Brainy</span>
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
                <div className="space-y-1">
                    {mainNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                className={cn("sidebar-item", isActive && "active")}
                            >
                                <Icon className="sidebar-item-icon" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Subjects Tree View */}
                <div className="sidebar-section">
                    <button
                        onClick={() => setSubjectsExpanded(!subjectsExpanded)}
                        className="sidebar-section-title w-full flex items-center justify-between hover:bg-[var(--background-hover)] rounded mx-2 px-2 py-1"
                    >
                        <span>المواد الدراسية</span>
                        {subjectsExpanded ?
                            <ChevronDown className="w-3 h-3" /> :
                            <ChevronRight className="w-3 h-3" />
                        }
                    </button>

                    <AnimatePresence>
                        {subjectsExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {subjects.map((subject) => {
                                    const Icon = subject.icon;
                                    const isActive = pathname.includes(subject.id);

                                    return (
                                        <Link
                                            key={subject.id}
                                            href={`/subject/${subject.id}`}
                                            className={cn("tree-item", isActive && "bg-[var(--background-active)]")}
                                        >
                                            <Icon className="w-4 h-4 opacity-60" />
                                            <span>{subject.label}</span>
                                        </Link>
                                    );
                                })}

                                <Link
                                    href="/subjects"
                                    className="tree-item text-[var(--foreground-tertiary)]"
                                >
                                    <span className="text-xs">عرض الكل...</span>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Admin Section */}
                {role === 'admin' && (
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">الإدارة</div>
                        <Link
                            href="/admin"
                            prefetch={true}
                            className={cn(
                                "sidebar-item",
                                pathname.startsWith('/admin') && "active"
                            )}
                        >
                            <Settings className="sidebar-item-icon" />
                            لوحة التحكم
                        </Link>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[var(--border)]">
                <Link
                    href="/subscription"
                    className="block p-3 bg-[var(--background-hover)] rounded-lg hover:bg-[var(--background-active)] transition-colors"
                >
                    <p className="text-xs font-medium text-[var(--foreground)] mb-0.5">ترقية الحساب</p>
                    <p className="text-[10px] text-[var(--foreground-tertiary)]">وصول كامل للمحتوى</p>
                </Link>
            </div>
        </div>
    );
}
