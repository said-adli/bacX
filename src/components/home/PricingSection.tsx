"use client";

import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainyLogo } from "@/components/ui/BrainyLogo";

export function PricingSection() {
    return (
        <section className="py-32 px-6 relative" style={{ contentVisibility: 'auto' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/10 pointer-events-none"></div>
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <GlassCard className="p-12 md:p-20 text-center relative overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                            <Crown className="w-64 h-64 text-primary rotate-12" />
                        </div>

                        {/* New Branding Element: Brainy Logo Watermark */}
                        <div className="absolute top-10 left-10 opacity-[0.05] pointer-events-none">
                            <BrainyLogo variant="icon" className="w-32 h-32" />
                        </div>

                        <div className="relative z-10 w-full max-w-4xl">
                            <h2 className="text-4xl md:text-6xl font-serif text-white mb-8">استثمر في مستقبلك مع Brainy</h2>
                            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
                                احصل على وصول كامل لجميع الدروس، الملخصات، والحصص المباشرة.
                                انضم إلى النخبة اليوم.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link href="/auth/signup" className="w-full sm:w-auto px-10 py-5 bg-primary rounded-[40px] text-white font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]">
                                    اشتراك سنوي (15,000 دج)
                                </Link>
                                <Link href="/pricing" className="text-white/80 hover:text-primary transition-colors underline underline-offset-8">
                                    عرض بـاقي الخطط
                                </Link>
                            </div>

                            <div className="mt-12 flex items-center justify-center gap-8 text-white/50 text-sm">
                                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> ضمان استرجاع الأموال</span>
                                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> دعم فني 24/7</span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    );
}
