"use client";

import { motion } from "framer-motion";
import { Check, Crown, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainyLogo } from "@/components/ui/BrainyLogo";
import { SubscriptionPlan } from "@/actions/admin-plans";

interface PricingSectionProps {
    plans: SubscriptionPlan[];
}

export function PricingSection({ plans }: PricingSectionProps) {
    // Fallback if no plans are passed/active
    if (!plans || plans.length === 0) {
        return (
            <section className="py-32 px-6 relative" style={{ contentVisibility: 'auto' }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/10 pointer-events-none"></div>
                <div className="max-w-5xl mx-auto text-center">
                    <GlassCard className="p-12 md:p-20 text-center relative overflow-hidden flex flex-col items-center">
                        <div className="relative z-10 w-full max-w-4xl">
                            <h2 className="text-4xl md:text-6xl font-serif text-white mb-8">الاشتراكات مغلقة حالياً</h2>
                            <p className="text-xl text-white/70">يرجى التحقق لاحقاً لفتح باب التسجيل.</p>
                        </div>
                    </GlassCard>
                </div>
            </section>
        )
    }

    return (
        <section className="py-32 px-6 relative" style={{ contentVisibility: 'auto' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/10 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">خطط تناسب طموحك</h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">اختر الخطة التي تضمن لك التفوق والتميز في مسارك الدراسي</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="p-8 relative group border-white/10 hover:border-primary/40 transition-all duration-300 flex flex-col h-full rounded-[2rem]">
                                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Zap className="text-primary fill-primary/20" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-4xl font-bold text-white font-mono">{plan.discount_price || plan.price}</span>
                                        <span className="text-lg text-white/50">دج</span>
                                        {plan.discount_price && <span className="text-lg text-white/40 line-through ml-2 font-mono">{plan.price}</span>}
                                    </div>

                                    <p className="text-white/60 mb-8 flex-1 text-sm leading-relaxed">{plan.description}</p>

                                    <div className="space-y-3 mb-8">
                                        {plan.features.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                                                <div className="min-w-[20px] h-[20px] rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <Check size={12} className="text-green-400" />
                                                </div>
                                                {f}
                                            </div>
                                        ))}
                                    </div>

                                    <Link href="/auth/signup" className="w-full py-4 rounded-xl bg-white/10 hover:bg-primary text-white font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_-5px_var(--primary-glow)] mt-auto">
                                        اشترك الآن <ArrowUpRight size={18} />
                                    </Link>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
