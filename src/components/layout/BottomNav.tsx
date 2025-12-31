"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Library, Radio, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: "الرئيسية",
            href: "/dashboard",
            icon: Home
        },
        {
            label: "المكتبة",
            href: "/subjects",
            icon: Library
        },
        {
            label: "مباشر",
            href: "/live",
            icon: Radio
        },
        {
            label: "الملف",
            href: "/profile",
            icon: User
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            {/* Glass Container */}
            <div className="mx-4 mb-4 rounded-3xl bg-glass backdrop-blur-xl border border-white/10 shadow-lg">
                <div className="flex items-center justify-around p-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300"
                            >
                                {/* Active Indicator Background (Glow) */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl blur-sm" />
                                )}

                                <Icon
                                    className={cn(
                                        "w-6 h-6 transition-all duration-300",
                                        isActive
                                            ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] scale-110"
                                            : "text-slate-500 dark:text-slate-400"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "text-[10px] font-medium transition-colors duration-300",
                                        isActive
                                            ? "text-primary"
                                            : "text-slate-500 dark:text-slate-400"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
