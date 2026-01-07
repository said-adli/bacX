"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, User, Crown, Settings, ChevronDown, ChevronRight, Brain, Calculator, FlaskConical, Microscope, HelpCircle } from "lucide-react";

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
    const role = profile?.role || 'student';
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(true);

    return (
        <div className="w-full h-full flex flex-col bg-transparent">
            {/* Logo */}
            <div className="h-24 flex items-center justify-center border-b border-white/5 mx-6">
                <Link href="/dashboard" prefetch={false} className="group">
                    <BrainyLogo variant="navbar" className="h-12 w-auto" />
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8 scrollbar-none">
                <div className="space-y-2">
                    {mainNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon || HelpCircle;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={false}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className={cn(
                                    "w-6 h-6 shrink-0",
                                    isActive ? "text-primary" : ""
                                )} />
                                <span className="text-base font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Subjects */}
                <div>
                    <button
                        onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
                        className="w-full flex items-center justify-between px-6 py-2 text-xs font-bold uppercase tracking-widest text-white/40 mb-2 hover:text-white/60"
                    >
                        <span>المواد الدراسية</span>
                        {isSubjectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    {isSubjectsOpen && (
                        <div className="space-y-1">
                            {subjects.map((subject) => {
                                const Icon = subject.icon || HelpCircle;
                                const isActive = pathname.includes(subject.id);

                                return (
                                    <Link
                                        key={subject.id}
                                        href={`/subject/${subject.id}`}
                                        prefetch={false}
                                        className={cn(
                                            "flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-200 mr-4",
                                            isActive ? "bg-primary/5 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "")} />
                                        <span className="text-sm font-medium">{subject.label}</span>
                                    </Link>
                                );
                            })}

                            <Link
                                href="/subjects"
                                prefetch={false}
                                className="flex items-center gap-4 px-6 py-3 text-sm text-primary/70 hover:text-primary mr-4"
                            >
                                <ChevronRight className="w-4 h-4" />
                                <span>عرض كل المواد...</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Admin */}
                {role === 'admin' && (
                    <div className="pt-4 border-t border-white/5 mx-4">
                        <Link
                            href="/admin"
                            prefetch={false}
                            className={cn(
                                "flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-200",
                                pathname.startsWith('/admin') ? "bg-red-500/10 text-red-500" : "text-white/60 hover:text-red-400 hover:bg-red-500/5"
                            )}
                        >
                            <Settings className="w-6 h-6 shrink-0" />
                            <span className="font-medium">لوحة التحكم</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Upgrade Card */}
            <div className="p-6">
                <Link
                    href="/subscription"
                    prefetch={false}
                    className="block rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-primary/50 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-base mb-1">ترقية الحساب</h4>
                            <p className="text-xs text-white/50">افتح جميع الدروس والتمارين الآن</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
