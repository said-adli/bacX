"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, FileVideo, LogOut, Shield, BookOpen, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const adminNavItems = [
    { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/admin/academic", label: "المسار الدراسي", icon: BookOpen },
    { href: "/admin/plans", label: "برامج الاشتراك", icon: Tag },
    { href: "/admin/payments", label: "المدفوعات", icon: CreditCard },
    { href: "/admin/users", label: "المستخدمين", icon: Users },
    { href: "/admin/content", label: "المحتوى والبث", icon: FileVideo },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="fixed right-0 top-0 h-screen w-64 bg-white/90 backdrop-blur-xl border-l border-blue-100/50 flex flex-col z-50 transition-transform duration-300 shadow-xl shadow-blue-900/5">
            {/* Logo */}
            <div className="h-20 flex items-center justify-center border-b border-blue-50/50 bg-blue-50/20">
                <div className="flex items-center gap-2 text-blue-600">
                    <Shield className="w-6 h-6" />
                    <h1 className="text-2xl font-bold font-sans tracking-tight">
                        ADMIN<span className="text-slate-900">PANEL</span>
                    </h1>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
                {adminNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-sans text-sm font-medium",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-[-2px]"
                                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

                })}
        </nav>

            {/* Footer / Logout */ }
    <div className="p-4 border-t border-blue-50/50 bg-blue-50/10">
        <Link href="/dashboard" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white transition-all font-medium text-sm mb-2">
            <LayoutDashboard className="w-5 h-5" />
            العودة للمنصة
        </Link>
        <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
        >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
        </button>
    </div>
        </aside >
    );
}
