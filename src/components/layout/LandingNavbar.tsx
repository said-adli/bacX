"use client";
import React from "react";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { useEffect, useState } from "react";

const LandingNavbarComponent = function LandingNavbar({ authButton }: { authButton: React.ReactNode }) {
    const [isScrolled, setIsScrolled] = useState(false);

    // Scroll listener for header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-500",
                isScrolled ? "bg-[#0A0A0F]/70 backdrop-blur-lg border-b border-white/5 py-3" : "bg-transparent py-5"
            )}
        >
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                {/* Right Side: Brand */}
                <div className="relative group select-none flex items-center gap-6 z-20">
                    <div className="h-[50px] md:h-[65px] w-auto flex items-center justify-center">
                        {/* Logo is white since the dark background/header requires it (previously inverted black logo) */}
                        <Logo className="h-full w-auto text-white drop-shadow-xl" />
                    </div>
                </div>

                {/* Center: Navigation Pill */}
                <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 px-2 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg">
                    {[
                        { label: "المنتج", href: "/product" },
                        { label: "المسارات", href: "/tracks" },
                        { label: "الأسعار", href: "/pricing" },
                        { label: "المدونة", href: "/blog" },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Left Side: Login / Auth - Dynamic Slot */}
                <div className="relative z-20">
                    {authButton}
                </div>
            </div>
        </motion.header>
    );
};

export const LandingNavbar = React.memo(LandingNavbarComponent);
