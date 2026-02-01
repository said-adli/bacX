"use client";

import React from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import { Logo } from "@/components/ui/Logo";
import { usePageVisibility } from "@/hooks/usePageVisibility";

export function HeroSection() {
    const isVisible = usePageVisibility();
    const containerRef = React.useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax Effect
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden mesh-bg"
        // We use standard ref/style for parallax to allow server rendering of initial state if possible,
        // but for now, we'll keep motion.section for the background parallax if vital.
        // Actually, for LCP, we should ensure the TEXT is server rendered and visible.
        >
            {/* Background Layers - Optimized */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

            {/* Standard Motion Div for Background Parallax only */}
            <motion.div
                style={{ y: yHero, opacity: opacityHero }}
                className="absolute inset-0 w-full h-full pointer-events-none"
            >
                {isVisible && <NeuralBackground />}
            </motion.div>

            {/* Animated Floating Elements — GPU Accelerated (Client Side Decoration) */}
            {isVisible && (
                <>
                    <motion.div
                        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] transform-gpu translate-z-0 will-change-transform"
                    />
                    <motion.div
                        animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 left-20 w-96 h-96 bg-accent/15 rounded-full blur-[120px] transform-gpu translate-z-0 will-change-transform"
                    />
                </>
            )}

            <div className="relative z-10 max-w-4xl mx-auto mt-16 w-full">
                {/* Content Container */}
                <div className="flex flex-col items-center">

                    {/* Badge - Animated In */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="flex items-center justify-center gap-2 mb-6"
                    >
                        <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs tracking-[0.2em] font-medium uppercase backdrop-blur-sm shadow-[0_0_15px_-5px_#2563EB]">
                            Start Your Journey
                        </span>
                    </motion.div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
                        <Logo className="w-[600px] h-[600px] opacity-[0.03] blur-xl text-white" />
                    </div>

                    {/* GPU Accelerated Text - LCP PRIORITY - Rendered initially visible, then animated */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10 text-6xl md:text-8xl font-serif text-white mb-8 leading-tight drop-shadow-2xl transform-gpu translate-z-0"
                    >
                        منصة <span className="text-gradient-blue">التفوق</span> <br />
                        الأكاديمي
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed font-sans"
                    >
                        رحلة سينمائية نحو النجاح، مصممة للنخبة الطموحة.
                        محتوى تعليمي يتجاوز التوقعات.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex flex-col items-center justify-center gap-6"
                    >
                        <Link href="/auth/signup" className="group relative px-12 py-6 bg-blue-600 rounded-[40px] text-white font-bold text-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-blue-500 shadow-xl shadow-blue-500/70 hover:shadow-blue-400/90">
                            <span className="relative z-10 flex items-center gap-3">
                                ابدأ رحلتك الآن
                                <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2" />
                            </span>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 2, duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
                >
                    <span className="text-xs uppercase tracking-widest">اكتشف المزيد</span>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/50 to-transparent"></div>
                </motion.div>
            )}
        </section>
    );
}
