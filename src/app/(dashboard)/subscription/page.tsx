"use client";

import { Check, Star, Zap, Shield, ArrowDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PaymentModal } from "@/components/subscription/PaymentModal";
import { uploadReceipt, createSubscriptionRequest } from "@/lib/payment";

export default function SubscriptionPage() {
    const pricingRef = useRef<HTMLDivElement>(null);

    const scrollToPricing = () => {
        pricingRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Mock Status Data
    const status = {
        plan: "المتفوق",
        daysLeft: 12,
        totalDays: 30,
        expiry: "2026-02-15",
        active: true
    };

    const progressPercentage = (status.daysLeft / status.totalDays) * 100;

    const plans = [
        {
            name: "البداية",
            price: "مجاني",
            period: "مدى الحياة",
            features: ["الوصول للمواد المجانية", "اختبارات تجريبية محدودة", "دعم فني عبر البريد"],
            cta: "ابدأ الآن",
            featured: false,
            icon: Star
        },
        {
            name: "المتفوق",
            price: "199",
            period: "درهم / شهر",
            features: ["جميع المواد الدراسية", "حصص مباشرة أسبوعية", "تصحيح الفروض والامتحانات", "مجموعة واتساب خاصة"],
            cta: "اشترك الآن",
            featured: true,
            icon: Zap
        },
        {
            name: "النخبة",
            price: "1500",
            period: "درهم / سنة",
            features: ["كل مميزات المتفوق", "توجيه أكاديمي شخصي", "حصص دعم فردية", "ضمان استرجاع الأموال"],
            cta: "تواصل معنا",
            featured: false,
            icon: Shield
        },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">

            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-serif font-bold text-white">اشتراكي</h1>
                <p className="text-white/60">إدارة حسابك وتجديد الاشتراك</p>
            </div>

            {/* Status Card */}
            <div className="max-w-4xl mx-auto">
                <GlassCard className="p-8 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Right: Plan Info */}
                        <div className="text-center md:text-right space-y-2">
                            <h2 className="text-2xl font-bold flex items-center gap-2 justify-center md:justify-start">
                                <Zap className="text-yellow-400 fill-yellow-400" />
                                باقة {status.plan}
                            </h2>
                            <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30">
                                {status.active ? "اشتراك نشط" : "اشتراك منتهي"}
                            </div>
                        </div>

                        {/* Center: Progress Bar */}
                        <div className="flex-1 w-full max-w-md space-y-2">
                            <div className="flex justify-between text-sm text-white/60 mb-1">
                                <span>الأيام المتبقية</span>
                                <span>{status.daysLeft} يوم</span>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-white/40 text-left pl-1">ينتهي في {status.expiry}</p>
                        </div>

                        {/* Left: Renew Action */}
                        <div>
                            <button
                                onClick={scrollToPricing}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all flex items-center gap-2"
                            >
                                تجديد الاشتراك
                                <ArrowDown size={16} />
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Pricing Section Title */}
            <div className="text-center pt-8" ref={pricingRef}>
                <h2 className="text-3xl font-serif font-bold mb-4">باقات الاشتراك</h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                    استثمر في مستقبلك مع أفضل الأدوات التعليمية
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 pb-12">
                {plans.map((plan, i) => (
                    <GlassCard
                        key={i}
                        className={`relative p-8 flex flex-col gap-6 transition-all duration-500 group
                            ${plan.featured
                                ? "bg-white/5 border-blue-500/50 shadow-[0_0_40px_rgba(37,99,235,0.15)] scale-105 z-10"
                                : "hover:bg-white/10 hover:border-white/20"
                            }
                        `}
                    >
                        {plan.featured && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-900/40 whitespace-nowrap">
                                الأكثر طلباً 🔥
                            </div>
                        )}

                        <div className="text-center space-y-4">
                            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4
                                ${plan.featured ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-white/40"}
                            `}>
                                <plan.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-5xl font-bold font-serif tracking-tight">{plan.price}</span>
                                <span className="text-sm text-white/40 self-end mb-2">{plan.period}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 flex-1 py-6 border-t border-white/5">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm text-white/70">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 
                                        ${plan.featured ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/30"}
                                    `}>
                                        <Check size={12} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`w-full py-4 rounded-xl font-bold transition-all relative overflow-hidden group/btn
                            ${plan.featured
                                    ? "bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] hover:scale-[1.02]"
                                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                }
                            `}
                        >
                            <span className="relative z-10">{plan.cta}</span>
                            {plan.featured && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                            )}
                        </button>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
