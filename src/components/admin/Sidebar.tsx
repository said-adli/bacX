"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, FileVideo, Radio, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const adminNavItems = [
    { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/admin/payments", label: "المدفوعات", icon: CreditCard },
    { href: "/admin/users", label: "المستخدمين", icon: Users },
    { href: "/admin/content", label: "المحتوى والبث", icon: FileVideo },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="fixed right-0 top-0 h-screen w-64 bg-[#0a0a0a] border-l border-white/10 flex flex-col z-50 transition-transform duration-300 shadow-2xl">
            {/* Logo */}
            <div className="h-20 flex items-center justify-center border-b border-white/5 bg-red-500/5">
                <div className="flex items-center gap-2 text-red-500">
                    <Shield className="w-6 h-6" />
                    <h1 className="text-2xl font-bold font-sans tracking-tight">
                        ADMIN<span className="text-white">PANEL</span>
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
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-500 group-hover:text-white")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-white/5 bg-red-500/5">
                <Link href="/dashboard" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-sans text-sm font-medium mb-2">
                    <LayoutDashboard className="w-5 h-5" />
                    العودة للمنصة
                </Link>
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-sans text-sm font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    );
}
