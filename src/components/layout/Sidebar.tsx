"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, User, Crown, Settings, ChevronDown, ChevronRight, Brain, Calculator, FlaskConical, Microscope } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BrainyLogo } from "@/components/ui/BrainyLogo";

// ============================================================================
// SIDEBAR - CLIENT COMPONENT
// ============================================================================
// RULES:
// - Standard <Link> with prefetch={false}
// - NO router.push, NO useTransition
// - Only state: isSubjectsOpen toggle
// ============================================================================

const NAV = [
    { href: "/dashboard", label: "الرئيسية", icon: Home },
    { href: "/subscription", label: "الاشتراك", icon: Crown },
    { href: "/profile", label: "الحساب", icon: User },
];

const SUBJECTS = [
    { id: "math", label: "الرياضيات", icon: Calculator },
    { id: "physics", label: "الفيزياء", icon: FlaskConical },
    { id: "science", label: "العلوم", icon: Microscope },
    { id: "philosophy", label: "الفلسفة", icon: Brain },
];

export function Sidebar() {
    const pathname = usePathname();
    const { profile } = useAuth();
    const [open, setOpen] = useState(true);

    const isAdmin = profile?.role === "admin";

    return (
        <div className="w-full h-full flex flex-col">
            {/* Logo */}
            <div className="h-24 flex items-center justify-center border-b border-white/5 mx-6">
                <Link href="/dashboard" prefetch={false}>
                    <BrainyLogo variant="navbar" className="h-12 w-auto" />
                </Link>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8">
                <div className="space-y-2">
                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                prefetch={false}
                                className={`relative flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 ${active ? "bg-primary/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                            >
                                {active && <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-full shadow-[0_0_20px_rgba(37,99,235,0.8)]" />}
                                <Icon className={`w-6 h-6 ${active ? "text-primary" : ""}`} />
                                <span className="text-base font-medium">{label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Subjects */}
                <div>
                    <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/60">
                        <span>المواد الدراسية</span>
                        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    {open && (
                        <div className="space-y-1 mt-2">
                            {SUBJECTS.map(({ id, label, icon: Icon }) => {
                                const active = pathname.includes(id);
                                return (
                                    <Link
                                        key={id}
                                        href={`/subject/${id}`}
                                        prefetch={false}
                                        className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all mr-4 ${active ? "bg-primary/5 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                                    >
                                        <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                                        <span className="text-sm font-medium">{label}</span>
                                    </Link>
                                );
                            })}
                            <Link href="/subjects" prefetch={false} className="flex items-center gap-4 px-6 py-3 text-sm text-primary/70 hover:text-primary mr-4">
                                <ChevronRight className="w-4 h-4" />
                                <span>عرض كل المواد...</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Admin */}
                {isAdmin && (
                    <div className="pt-4 border-t border-white/5 mx-4">
                        <Link
                            href="/admin"
                            prefetch={false}
                            className={`flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all ${pathname.startsWith("/admin") ? "bg-red-500/10 text-red-500" : "text-white/60 hover:text-red-400 hover:bg-red-500/5"}`}
                        >
                            <Settings className="w-6 h-6" />
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
                    className="block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-1 transition-all duration-500"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
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
