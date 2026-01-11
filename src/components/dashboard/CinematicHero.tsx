"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CinematicHero() {
    return (
        <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden rounded-3xl mb-12 group">

            {/* 1. Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/earth-cinematic.png"
                    alt="Earth from space"
                    fill
                    className="object-cover transition-transform duration-[20s] ease-linear scale-100 group-hover:scale-110"
                    priority
                />
            </div>

            {/* 2. Cinematic Overlay/Gradient */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/20 to-[#0A0A0F] opacity-90" />

            {/* Blue Glow Accent (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-900/40 to-transparent z-10 opacity-60" />

            {/* 3. Content */}
            <div className="relative z-20 text-center space-y-8 px-4 max-w-4xl mx-auto mt-20">

                {/* Badge / Subtitle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4"
                >
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-blue-100/80 uppercase">Daily Inspiration</span>
                </motion.div>

                {/* Main Arabic Text */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                >
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-50 to-blue-200/80 pb-4">
                        العلم نور يقذفه الله
                    </span>
                    <span className="block text-3xl md:text-5xl lg:text-5xl font-light text-blue-200/60 mt-2">
                        في قلب من يشاء
                    </span>
                </motion.h1>

                {/* Decorative Line */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100px", opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto"
                />

                {/* CTA Button (Minimal) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="pt-8"
                >
                    <Link
                        href="/materials"
                        className="group/btn relative inline-flex items-center gap-3 px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                    >
                        <span>تابع رحلة التعلم</span>
                        <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform duration-300 text-blue-400" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
