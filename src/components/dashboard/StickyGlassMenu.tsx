"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, CreditCard, Users, Settings, ChevronDown } from "lucide-react";

export default function StickyGlassMenu() {
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
        { name: "الاشتراك", href: "/subscription", icon: CreditCard },
        { name: "المجتمع", href: "/community", icon: Users },
        { name: "الإعدادات", href: "/settings", icon: Settings },
    ];

    return (


        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-1 p-2 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

                {/* Logo */}
                <div className="relative w-10 h-10 ml-2">
                    <Image
                        src="/images/brainy-logo-v2.png"
                        alt="Brainy"
                        fill
                        className="object-contain"
                    />
                </div>

                {/* Profile Dropdown Trigger */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300
                                ${pathname === '/profile' || isProfileOpen
                                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10"
                                : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                            }
                            `}
                    >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">الملف الشخصي</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute top-full mt-2 left-0 w-48 bg-[#0F0F16]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left flex flex-col p-1.5">
                            <Link
                                href="/profile"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm"
                            >
                                <User size={16} />
                                <span>عرض الملف</span>
                            </Link>

                        </div>
                    )}
                </div>

                {/* Other Items */}
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
