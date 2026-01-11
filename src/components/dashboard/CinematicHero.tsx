"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CinematicHero() {
    return (
        <div className="relative w-full h-[75vh] min-h-[700px] flex items-center justify-center overflow-hidden rounded-[2.5rem] mb-12 group border border-white/10 border-t-white/30 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]">

            {/* 1. Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/earth-cinematic.png"
                    alt="Earth from space"
                    fill
                    className="object-cover transition-transform duration-[30s] ease-linear scale-100 group-hover:scale-105"
                    priority
                />
            </div>

            {/* 2. Cinematic Overlay/Gradient */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-black/10 to-[#0A0A0F]/90" />

            {/* Glass Reflection Top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent z-20 opacity-50" />

            {/* 3. Content */}
            <div className="relative z-20 text-center space-y-10 px-4 max-w-5xl mx-auto flex flex-col items-center justify-center h-full pt-20">

                {/* Badge / Subtitle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                >
                    <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                    <span className="text-xs font-bold tracking-[0.25em] text-blue-100/90 uppercase">Daily Inspiration</span>
                </motion.div>

                {/* Main English Quote */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-serif italic font-light text-white/90 leading-tight drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] tracking-wide"
                >
                    &ldquo;knowledge is light,<br />
                    <span className="text-white/70">guided by the heart.&rdquo;</span>
                </motion.h1>

                {/* Decorative Line */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "120px", opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto opacity-60"
                />

                {/* CTA Button (Minimal) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="pt-4"
                >
                    <Link
                        href="/materials"
                        className="group/btn relative inline-flex items-center gap-4 px-10 py-4 bg-white/5 backdrop-blur-md border border-white/10 border-t-white/20 rounded-full text-base font-medium text-white transition-all hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]"
                    >
                        <span>Explore Galaxy</span>
                        <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform duration-300 text-blue-300" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
