"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, User, Crown, Settings, ChevronDown, ChevronRight, Brain, Calculator, FlaskConical, Microscope, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useState, useCallback } from "react";
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
    const router = useRouter();
    const { profile } = useAuth();

    // Default to 'student' if no profile
    const role = profile?.role || 'student';
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(true);

    const handleNavigation = useCallback((href: string) => {
        router.push(href);
    }, [router]);

    return (
        <div className="w-full h-full flex flex-col bg-transparent relative z-[70] pointer-events-auto">
            {/* Logo - Perfectly Centered */}
            <div className="h-24 flex items-center justify-center border-b border-white/5 mx-6">
                <div
                    onClick={() => handleNavigation("/dashboard")}
                    className="group cursor-pointer"
                >
                    <BrainyLogo variant="navbar" className="h-12 w-auto" />
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8 scrollbar-none">
                <div className="space-y-2">
                    {mainNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        // CRITICAL: Fallback to HelpCircle to prevent SVG path errors
                        const Icon = item.icon || HelpCircle;

                        return (
                            <div
                                key={item.href}
                            >
                                <div
                                    onClick={() => handleNavigation(item.href)}
                                    className={cn(
                                        "relative z-[80] flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden cursor-pointer",
                                        isActive
                                            ? "bg-primary/10 text-white"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {/* Active Indicator - Glowing */}
                                    {isActive && (
                                        <div
                                            className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-full shadow-[0_0_20px_rgba(37,99,235,0.8)]"
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
                                </div>
                            </div>
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

                    {/* AnimatePresence removed */}
                    {isSubjectsOpen && (
                        <div
                            className="space-y-1 overflow-hidden"
                        >
                            {subjects.map((subject) => {
                                // CRITICAL: Fallback to HelpCircle to prevent SVG path errors
                                const Icon = subject.icon || HelpCircle;
                                const isActive = pathname.includes(subject.id);
                                const subjectHref = `/subject/${subject.id}`;

                                return (
                                    <div
                                        key={subject.id}
                                    >
                                        <div
                                            onClick={() => handleNavigation(subjectHref)}
                                            className={cn(
                                                "relative z-[80] flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group mr-4 cursor-pointer",
                                                isActive ? "bg-primary/5 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {isActive && (
                                                <div
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full shadow-[0_0_12px_rgba(37,99,235,0.6)]"
                                                />
                                            )}

                                            <Icon className={cn(
                                                "w-5 h-5 shrink-0 transition-colors",
                                                isActive ? "text-primary" : "group-hover:text-primary/70"
                                            )} />
                                            <span className="text-sm font-medium">{subject.label}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            <div
                            >
                                <div
                                    onClick={() => handleNavigation("/subjects")}
                                    className="relative z-[80] flex items-center gap-4 px-6 py-3 text-sm text-primary/70 hover:text-primary transition-colors mr-4 cursor-pointer"
                                >
                                    <div className="w-5 flex justify-center"><ChevronRight className="w-4 h-4" /></div>
                                    <span>عرض كل المواد...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* AnimatePresence removed */}
                </div>

                {/* Admin Section */}
                {role === 'admin' && (
                    <div className="pt-4 border-t border-white/5 mx-4">
                        <div
                        >
                            <div
                                onClick={() => handleNavigation("/admin")}
                                className={cn(
                                    "relative z-[80] flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 group cursor-pointer",
                                    pathname.startsWith('/admin') ? "bg-red-500/10 text-red-500" : "text-white/60 hover:text-red-400 hover:bg-red-500/5"
                                )}
                            >
                                <Settings className="w-6 h-6 shrink-0" />
                                <span className="font-medium">لوحة التحكم</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Upgrade Card - Floating Glass */}
            <div className="p-6 relative z-10">
                <div
                    onClick={() => handleNavigation("/subscription")}
                    className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-1 cursor-pointer"
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
                </div>
            </div>
        </div>
    );
}
