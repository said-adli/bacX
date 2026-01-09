"use client";

import React from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import { BrainyLogo } from "@/components/ui/BrainyLogo";

// No props interface needed

export function HeroSection() {
    const containerRef = React.useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax Effect: Move text down slightly as user scrolls
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
    // Opacity Fade: Fade out as element leaves the viewport
    const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <motion.section
            ref={containerRef}
            className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden mesh-bg"
            style={{ y: yHero, opacity: opacityHero }}
        >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

            {/* Neural Background Effects */}
            <NeuralBackground />

            {/* Animated Floating Elements — Electric Blue */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 left-20 w-96 h-96 bg-accent/15 rounded-full blur-[120px]"
            />

            <div className="relative z-10 max-w-4xl mx-auto mt-16 w-full">
                <motion.div
                    key="content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex items-center justify-center gap-2 mb-6"
                    >
                        {/* Subtle Badge */}
                        <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs tracking-[0.2em] font-medium uppercase backdrop-blur-sm shadow-[0_0_15px_-5px_#2563EB]">
                            Start Your Journey
                        </span>
                    </motion.div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
                        <BrainyLogo variant="watermark" className="w-[600px] h-[600px] opacity-[0.03] blur-xl" />
                    </div>

                    <h1 className="relative z-10 text-6xl md:text-8xl font-serif text-white mb-8 leading-tight drop-shadow-2xl">
                        منصة <span className="text-gradient-blue">التفوق</span> <br />
                        الأكاديمي
                    </h1>

                    <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed font-sans">
                        رحلة سينمائية نحو النجاح، مصممة للنخبة الطموحة.
                        محتوى تعليمي يتجاوز التوقعات.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6">
                        <Link href="/auth/signup" className="group relative px-12 py-6 bg-emerald-500/20 rounded-[40px] text-white font-bold text-2xl overflow-hidden transition-all hover:scale-105 border border-emerald-500/50 shadow-[0_0_40px_-5px_rgba(16,185,129,0.4)] backdrop-blur-xl">
                            <span className="relative z-10 flex items-center gap-3 drop-shadow-md">
                                ابدأ رحلتك الآن
                                <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2" />
                            </span>
                            {/* Inner Glow Pulse */}
                            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                            {/* Hover Sweep */}
                            <div className="absolute inset-0 bg-emerald-400/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
            >
                <span className="text-xs uppercase tracking-widest">اكتشف المزيد</span>
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/50 to-transparent"></div>
            </motion.div>
        </motion.section>
    );
}
