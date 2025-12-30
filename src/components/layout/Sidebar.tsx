"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Radio, Users, LogOut, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/lessons", label: "الدروس", icon: BookOpen },
    { href: "/subjects", label: "المواد", icon: Library },
    { href: "/live", label: "البث المباشر", icon: Radio },
    // Admin only
    { href: "/admin/dashboard", label: "الإدارة", icon: Users, adminOnly: true },
];

export function Sidebar() {
    const pathname = usePathname();
    const { role, logout } = useAuth();

    return (
        <aside className="fixed right-0 top-0 h-screen w-64 bg-background/80 backdrop-blur-xl border-l border-border flex flex-col z-50 transition-transform duration-300 shadow-xl">
            {/* Logo */}
            <div className="h-20 flex items-center justify-center border-b border-border/50">
                <h1 className="text-3xl font-bold font-sans tracking-tight text-primary">
                    BAC<span className="text-foreground">X</span>
                </h1>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
                {navItems.map((item) => {
                    if (item.adminOnly && role !== 'admin') return null;

                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-sans text-sm font-medium",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-border/50">
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-all font-sans text-sm font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    );
}
