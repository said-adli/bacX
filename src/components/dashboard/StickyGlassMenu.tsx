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
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
            <div className="flex items-center gap-1 p-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                ${isActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }
              `}
                        >
                            <item.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{item.name}</span>
                            {isActive && (
                                <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
