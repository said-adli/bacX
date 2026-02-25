"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Video, User, Brain } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "الرئيسية", href: "/dashboard", icon: Home },
        { name: "المواد", href: "/materials", icon: BookOpen },
        { name: "Brainy", href: "/", icon: Brain, isHero: true }, // Updated
        { name: "مباشر", href: "/live", icon: Video },
        { name: "حسابي", href: "/profile", icon: User },
    ];

    return (
        <div className="fixed bottom-0 w-full z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
            {/* Glass Container */}
            <div className="bg-[#020617]/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] px-4 py-3 transform-gpu relative">
                <nav className="flex items-center justify-between">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        if (item.isHero) {
                            return (
                                <div key={item.href} className="relative -mt-8">
                                    <Link href={item.href}>
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            className={`
                        w-14 h-14 rounded-full flex items-center justify-center
                        bg-gradient-to-r from-blue-600 to-purple-600
                        shadow-[0_0_20px_rgba(124,58,237,0.5)] border-2 border-[#0B0E14]
                        text-white
                      `}
                                        >
                                            <Image
                                                src="/images/logo.png"
                                                alt="Brainy"
                                                width={32}
                                                height={32}
                                                className="object-contain"
                                            />
                                        </motion.div>
                                    </Link>
                                    {/* Text Label Removed as requested */}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-1 min-w-[3.5rem]"
                            >
                                <div className={`
                  p-2 rounded-xl transition-all duration-300
                  ${isActive ? "bg-white/10 text-blue-400 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]" : "text-white/40 hover:text-white/80"}
                `}>
                                    <item.icon className={`w-5 h-5 ${isActive ? "fill-blue-400/20" : ""}`} />
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="w-1 h-1 rounded-full bg-blue-500 mt-0.5 shadow-[0_0_8px_rgba(59,130,246,1)]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
