"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Radio, User } from "lucide-react";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", icon: Home, label: "الرئيسية" },
        { href: "/subjects", icon: BookOpen, label: "المكتبة" },
        { href: "/live", icon: Radio, label: "مباشر" },
        { href: "/profile", icon: User, label: "حسابي" },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
            <nav className="bg-glass/90 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-full px-6 py-4 flex items-center justify-between relative overflow-hidden">
                {/* Shine Effect */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></div>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-col items-center justify-center transition-all duration-300 ${isActive ? "text-gold -translate-y-1" : "text-white/50 hover:text-white"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 bg-gold/30 blur-xl rounded-full pointer-events-none"></div>
                            )}

                            <item.icon
                                className={`w-6 h-6 mb-1 ${isActive ? "drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" : ""
                                    }`}
                            />
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
