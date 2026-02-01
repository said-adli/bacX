"use client";

import { motion } from "framer-motion";
import { PenTool, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white font-tajawal flex items-center justify-center relative overflow-hidden p-6" dir="rtl">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <GlassCard className="p-10 md:p-14 border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center">

                        {/* Icon */}
                        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.05)] relative group">
                            {/* Inner glow pulse */}
                            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
                            <PenTool className="w-10 h-10 text-white/50 group-hover:text-blue-400 transition-colors relative z-10" />
                        </div>

                        {/* Text */}
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            مدونة المتفوقين.. قريباً
                        </h1>
                        <p className="text-lg text-white/50 leading-relaxed max-w-lg mb-10">
                            نعمل حالياً على كتابة مقالات استراتيجية، نصائح دراسية، وخطط مراجعة شاملة لمساعدتكم في تحضير البكالوريا 2026 بأعلى معايير الجودة.
                        </p>

                        {/* Action */}
                        <Link
                            href="/"
                            className={cn(
                                "group flex items-center gap-2 px-6 py-3 rounded-xl",
                                "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20",
                                "text-white/80 hover:text-white transition-all duration-300"
                            )}
                        >
                            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                            <span>العودة للرئيسية</span>
                        </Link>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
}
