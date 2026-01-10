"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CreditCard, Users, Settings } from "lucide-react";

export default function StickyGlassMenu() {
    const pathname = usePathname();

    const menuItems = [
        { name: "الملف الشخصي", href: "/profile", icon: User },
        { name: "الاشتراك", href: "/subscription", icon: CreditCard },
        { name: "المجتمع", href: "/community", icon: Users },
        { name: "الإعدادات", href: "/settings", icon: Settings },
    ];

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-1 p-2 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300
                            ${isActive
                                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10"
                                    : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                                }
                            `}
                        >
                            <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-blue-400" : "group-hover:text-blue-400"}`} />
                            <span className="text-sm font-medium">{item.name}</span>

                            {/* Bottom Glow for Active */}
                            {isActive && (
                                <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
