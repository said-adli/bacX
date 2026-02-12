"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, Loader2, Sparkles, Crown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PaymentModal } from "@/components/subscription/PaymentModal";
import { getActivePlans, SubscriptionPlan } from "@/actions/admin-plans";
import { uploadReceipt, createSubscriptionRequest } from "@/lib/payment";
import { useAuth } from "@/context/AuthContext";

// Color themes for alternating cards
const THEMES = [
    {
        accent: "purple",
        icon: Zap,
        iconFill: true,
        border: "border-purple-500/30 hover:border-purple-500/60",
        bg: "bg-purple-600/5 group-hover:bg-purple-600/10",
        glow: "-right-10 -top-10 bg-purple-500/20 group-hover:bg-purple-500/30",
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-400",
        tagColor: "text-purple-300",
        button: "bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]",
    },
    {
        accent: "blue",
        icon: TrendingUp,
        iconFill: false,
        border: "border-blue-500/30 hover:border-blue-500/60",
        bg: "bg-blue-600/5 group-hover:bg-blue-600/10",
        glow: "-left-10 -bottom-10 bg-blue-500/20 group-hover:bg-blue-500/30",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-400",
        tagColor: "text-blue-300",
        button: "bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]",
    },
    {
        accent: "emerald",
        icon: Sparkles,
        iconFill: false,
        border: "border-emerald-500/30 hover:border-emerald-500/60",
        bg: "bg-emerald-600/5 group-hover:bg-emerald-600/10",
        glow: "-right-10 -bottom-10 bg-emerald-500/20 group-hover:bg-emerald-500/30",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-400",
        tagColor: "text-emerald-300",
        button: "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]",
    },
    {
        accent: "amber",
        icon: Crown,
        iconFill: false,
        border: "border-amber-500/30 hover:border-amber-500/60",
        bg: "bg-amber-600/5 group-hover:bg-amber-600/10",
        glow: "-left-10 -top-10 bg-amber-500/20 group-hover:bg-amber-500/30",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-400",
        tagColor: "text-amber-300",
        button: "bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]",
    },
];

export function SubscriptionCards() {
    const { user } = useAuth();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchPlans() {
            try {
                const data = await getActivePlans();
                setPlans(data);
            } catch (e) {
                console.error("Failed to fetch plans:", e);
                setError("فشل تحميل الباقات");
            } finally {
                setLoading(false);
            }
        }
        fetchPlans();
    }, []);

    const handleSubscribeClick = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handlePaymentSubmit = async (file: File) => {
        if (!selectedPlan || !user) return;

        // 1. Upload receipt
        const receiptUrl = await uploadReceipt(file, user.id);
        if (!receiptUrl) {
            return;
        }

        // 2. Create subscription request
        await createSubscriptionRequest(user.id, selectedPlan.id, receiptUrl);
    };

    // Loading State
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <GlassCard key={i} className="p-6 animate-pulse">
                        <div className="h-12 w-12 rounded-xl bg-white/10 mb-4" />
                        <div className="h-6 w-32 bg-white/10 rounded mb-2" />
                        <div className="h-4 w-24 bg-white/10 rounded mb-4" />
                        <div className="h-16 bg-white/10 rounded mb-6" />
                        <div className="h-10 bg-white/10 rounded-xl" />
                    </GlassCard>
                ))}
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="text-center py-8 text-red-400">
                {error}
            </div>
        );
    }

    // No Plans
    if (plans.length === 0) {
        return null;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan, index) => {
                    const theme = THEMES[index % THEMES.length];
                    const IconComponent = theme.icon;

                    return (
                        <GlassCard
                            key={plan.id}
                            className={`p-6 flex flex-col justify-between relative overflow-hidden group ${theme.border} transition-all duration-500`}
                        >
                            {/* Background Effects */}
                            <div className={`absolute inset-0 ${theme.bg} transition-colors duration-500`} />
                            <div className={`absolute w-32 h-32 ${theme.glow} rounded-full blur-3xl transition-all`} />

                            {/* Content */}
                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center mb-4 ${theme.iconColor} group-hover:scale-110 transition-transform duration-500`}>
                                    <IconComponent size={24} className={theme.iconFill ? "fill-current" : ""} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className={`text-sm ${theme.tagColor} font-mono mb-4`}>
                                    {plan.discount_price ? (
                                        <>
                                            <span className="line-through text-white/40 mr-2">{plan.price} DA</span>
                                            <span className="font-bold">{plan.discount_price} DA</span>
                                        </>
                                    ) : (
                                        <span>{plan.price} DA</span>
                                    )}
                                </div>
                                <p className="text-sm text-white/60 mb-6">
                                    {plan.description || "وصول كامل لجميع المحتويات والموارد التعليمية."}
                                </p>
                            </div>

                            {/* Subscribe Button */}
                            <button
                                onClick={() => handleSubscribeClick(plan)}
                                className={`w-full py-2.5 rounded-xl ${theme.button} text-white font-bold text-sm transition-all relative z-10 group-hover:translate-y-[-2px]`}
                            >
                                اشترك الآن
                            </button>
                        </GlassCard>
                    );
                })}
            </div>

            {/* Payment Modal */}
            {selectedPlan && (
                <PaymentModal
                    planName={selectedPlan.name}
                    price={`${selectedPlan.discount_price || selectedPlan.price} DA`}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedPlan(null);
                    }}
                    onSubmit={handlePaymentSubmit}
                />
            )}
        </>
    );
}
