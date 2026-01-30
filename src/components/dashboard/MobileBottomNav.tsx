"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Video, User, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "الرئيسية", href: "/dashboard", icon: Home },
        { name: "المواد", href: "/materials", icon: BookOpen },
        { name: "تعلمي", href: "/learning", icon: GraduationCap, isHero: true },
        { name: "مباشر", href: "/live", icon: Video },
        { name: "حسابي", href: "/profile", icon: User },
    ];

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[90] md:hidden">
            {/* Glass Container */}
            <div className="bg-[#0B0E14]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/20 px-2 py-3">
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
                                            <item.icon className="w-6 h-6" />
                                        </motion.div>
                                    </Link>
                                    <span className="text-[10px] font-medium text-white/80 absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                        {item.name}
                                    </span>
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
