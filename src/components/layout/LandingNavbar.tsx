"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BrainyLogo } from "@/components/ui/BrainyLogo";
import { useEffect, useState } from "react";

export function LandingNavbar() {
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
                {/* Right Side: Luxury Brand (Imprinted + Soul) */}
                <div className="relative group select-none flex items-center gap-6 z-20">
                    <div className="relative flex items-center gap-4">
                        <BrainyLogo variant="full" className="h-[6rem] w-auto drop-shadow-xl" />
                    </div>
                </div>

                {/* Left Side: Minimal Login Button */}
                <Link href="/auth?mode=login" className="relative px-6 py-2 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition-all text-xs uppercase tracking-widest font-medium group overflow-hidden bg-white/5 hover:bg-white/10">
                    <span className="relative z-10 font-cinzel text-xs font-bold">Log In</span>
                </Link>
            </div>
        </motion.header>
    );
}
