"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    Crown, Clock, Check, Zap, Star,
    Download, ArrowUpRight, Gift, ScrollText
} from "lucide-react";
import { toast } from "sonner";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { getActivePlans, SubscriptionPlan } from "@/actions/admin-plans";
import Link from "next/link";
import { PlansGridSkeleton, BillingHistorySkeleton } from "@/components/ui/skeletons/SubscriptionSkeleton";

interface BillingTransaction {
    id: string;
    user_id: string;
    plan_type: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    date: string;
}

export default function SubscriptionPage() {
    const isVisible = usePageVisibility();
    const { user, profile } = useAuth();
    const supabase = createClient();

    // State
    const [promoCode, setPromoCode] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [history, setHistory] = useState<BillingTransaction[]>([]);

    // Dynamic Plans State
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    // Fetch Billing History AND Plans
    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            // 1. Billing History
            try {
                const { data, error } = await supabase
                    .from('billing_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false });

                if (data) setHistory(data);
            } catch (err) {
                console.error("Error fetching billing:", err);
            } finally {
                setLoadingHistory(false);
            }

            // 2. Dynamic Plans
            try {
                const activePlans = await getActivePlans();
                setPlans(activePlans);
            } catch (err) {
                console.error("Error fetching plans:", err);
            } finally {
                setLoadingPlans(false);
            }
        }

        fetchData();
    }, [user, supabase]);

    // Computed Real Plan State (Strict Mode)
    const currentPlan = profile?.is_subscribed
        ? {
            name: profile.plan_name || "باقة غير معروفة", // Fetched from DB relation
            type: "VIP Member",
            expiry: profile.subscription_end_date ? new Date(profile.subscription_end_date).toLocaleDateString('ar-DZ') : "غير محدود",
            isActive: true
        }
        : {
            name: "الباقة المجانية",
            type: "Free Tier",
            expiry: "غير محدود",
            isActive: false
        };

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsApplying(true);
        // Promo implementation
        setTimeout(() => {
            if (promoCode === "BAC2025") {
                toast.success("تم تفعيل كود الخصم بنجاح! استمتع بخصم 20%");
            } else {
                toast.error("كود الخصم غير صالح");
            }
            setIsApplying(false);
            setPromoCode("");
        }, 1500);
    };

    return (
        <div className={`space-y-12 animate-in fade-in zoom-in duration-500 pb-20 ${!isVisible ? "animations-paused" : ""}`}>

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.3)] gpu-accelerated">
                    <Crown className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">الاشتراكات والمدفوعات</h1>
                    <p className="text-white/40 text-sm">إدارة باقتك الحالية، سجل الدفعات، والترقيات المتاحة</p>
                </div>
            </div>

            {/* SECTION 1: Current Status & Promo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Plan Card */}
                <GlassCard className="lg:col-span-2 p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px] border-yellow-500/20 backdrop-blur-3xl">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-white/70">الحالة الحالية</span>
                                <span className={`flex h-2 w-2 rounded-full shadow-[0_0_10px] ${profile?.is_subscribed ? 'bg-yellow-400 shadow-yellow-400' : 'bg-green-500 shadow-green-500'} gpu-accelerated`} />
                            </div>
                            <h2 className="text-4xl font-bold text-white font-serif mb-1">{currentPlan.name}</h2>
                            <p className="text-yellow-400/80 font-mono text-sm tracking-wider uppercase">{currentPlan.type}</p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 gpu-accelerated">
                            <Crown size={32} className="text-yellow-400" />
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                        <div>
                            <div className="text-sm text-white/60 mb-1">صلاحية الباقة</div>
                            <div className="text-xl font-mono text-white">{currentPlan.expiry}</div>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${currentPlan.isActive
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${currentPlan.isActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
                            <span className="text-sm font-bold">
                                {currentPlan.isActive ? 'اشتراك نشط' : 'غير نشط'}
                            </span>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none gpu-accelerated" />
                </GlassCard>

                {/* Promo Code Section */}
                <GlassCard className="p-6 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Gift className="text-purple-400" size={20} />
                        <h3 className="font-bold text-white">لديك كود خصم؟</h3>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="أدخل الكود هنا"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-center tracking-widest uppercase"
                        />
                        <div className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-white/5 gpu-accelerated" />
                    </div>
                    <button
                        onClick={handleApplyPromo}
                        disabled={isApplying || !promoCode}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 gpu-accelerated"
                    >
                        {isApplying ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Zap size={16} className="fill-white" />
                                تفعيل الكود
                            </>
                        )}
                    </button>
                </GlassCard>
            </div>

            {/* SECTION 2: AVAILABLE UPGRADES - DYNAMIC */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Star className="text-yellow-400" size={20} />
                    الباقات المتوفرة للترقية
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingPlans ? (
                        <div className="col-span-full">
                            <PlansGridSkeleton />
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-white/40">
                            لا توجد باقات متاحة حالياً.
                        </div>
                    ) : (
                        plans.map((plan) => (
                            <GlassCard key={plan.id} className="p-6 relative group border-white/10 hover:border-primary/40 transition-all duration-300 flex flex-col">
                                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors gpu-accelerated" />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform">
                                        <Zap className="text-primary fill-primary/20" size={24} />
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>

                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-2xl font-bold text-white">{plan.discount_price || plan.price} دج</span>
                                        {plan.discount_price && <span className="text-sm text-white/40 line-through">{plan.price}</span>}
                                    </div>

                                    <p className="text-white/60 text-sm mb-6 flex-1 min-h-[60px]">{plan.description}</p>

                                    <div className="space-y-2 mb-6">
                                        {plan.features.slice(0, 4).map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                                                <Check size={12} className="text-green-400" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Link to New Checkout Page */}
                                    <Link
                                        href={`/checkout/${plan.id}`}
                                        className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:border-primary gpu-accelerated mt-auto"
                                    >
                                        اشترك الآن
                                        <ArrowUpRight size={16} />
                                    </Link>
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>

            {/* SECTION 3: BILLING HISTORY */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="text-blue-400" size={20} />
                    سجل العمليات السابقة
                </h3>

                <GlassCard className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right min-w-[600px]">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-medium">رقم العملية</th>
                                    <th className="p-4 font-medium">التاريخ</th>
                                    <th className="p-4 font-medium">التفاصيل</th>
                                    <th className="p-4 font-medium">المبلغ</th>
                                    <th className="p-4 font-medium">الحالة</th>
                                    <th className="p-4 font-medium">الفاتورة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loadingHistory ? (
                                    <tr>
                                        <td colSpan={6} className="p-0">
                                            <BillingHistorySkeleton />
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-white/40">
                                            لا توجد عمليات دفع سابقة
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-white/40 font-mono text-sm">#{item.id.slice(0, 8)}</td>
                                            <td className="p-4 text-white/80 text-sm">{new Date(item.date).toLocaleDateString("ar-DZ")}</td>
                                            <td className="p-4 text-white font-bold text-sm">{item.plan_type}</td>
                                            <td className="p-4 text-white/80 font-mono">{item.amount}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-md text-xs border ${item.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {item.status === 'completed' ? 'ناجحة' : item.status === 'pending' ? 'قيد المعالجة' : 'فاشلة'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
