"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    Crown, Clock, Check, Zap, Star,
    Download, ArrowUpRight, Gift, ScrollText, UploadCloud
} from "lucide-react";
import { toast } from "sonner";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Types
interface BillingTransaction {
    id: string;
    date: string;
    plan_type: string;
    amount: string;
    status: string;
}

interface SubscriptionPlan {
    name: string;
    type: string;
    expiry: string;
    progress: number;
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

    // Computed Real Plan State
    const currentPlan: SubscriptionPlan = profile?.is_subscribed
        ? {
            name: "باقة VIP المميزة",
            type: "Premium Member",
            expiry: "30 جوان 2026", // In a real app, verify 'subscription_end_date' from profile
            progress: 45 // Calculate days remaining / total days
        }
        : {
            name: "الباقة المجانية",
            type: "Free Tier",
            expiry: "غير محدود",
            progress: 100
        };

    // Fetch Billing History
    useEffect(() => {
        async function fetchBilling() {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('billing_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false });

                if (error) throw error;
                if (data) setHistory(data);
            } catch (err) {
                console.error("Error fetching billing:", err);
                // Fallback to empty or keep loading false (silent fail for UX)
            } finally {
                setLoadingHistory(false);
            }
        }

        fetchBilling();
    }, [user, supabase]);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsApplying(true);

        // Simulate Check against DB
        // In fully implemented version: await supabase.from('coupons').select('*').eq('code', promoCode)...
        setTimeout(() => {
            setIsApplying(false);
            if (promoCode.toLowerCase() === "brainy2025") {
                toast.success("تم تفعيل الكود بنجاح! حصلت على 20% خصم.");
            } else {
                toast.error("الكود غير صالح أو منتهي الصلاحية.");
            }
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

            {/* SECTION 1: CURRENT STATUS & PROMO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Current Plan Card - Glowing Gold */}
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

                    <div className="relative z-10 mt-8">
                        <div className="flex justify-between text-sm text-white/60 mb-2">
                            <span>صلاحية الباقة</span>
                            <span>{currentPlan.expiry}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 gpu-accelerated"
                                style={{ width: `${currentPlan.progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Ambience */}
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

                {/* Upload Receipt Section */}
                <GlassCard className="p-6 flex flex-col justify-center gap-4 lg:col-span-1">
                    <div className="flex items-center gap-3 mb-2">
                        <ScrollText className="text-blue-400" size={20} />
                        <h3 className="font-bold text-white">تأكيد الدفع اليدوي</h3>
                    </div>
                    <p className="text-xs text-white/50 mb-2">
                        إذا قمت بالدفع عبر بريدي موب، قم برفع صورة الوصل هنا ليتم تفعيل حسابك.
                    </p>
                    <div className="relative group cursor-pointer">
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !user) return;

                                const toastId = toast.loading("جاري رفع الوصل...");
                                try {
                                    // 1. Upload to Storage
                                    const fileName = `${user.id}-${Date.now()}`;
                                    const { data: uploadData, error: uploadError } = await supabase.storage
                                        .from('receipts')
                                        .upload(fileName, file);

                                    if (uploadError) throw uploadError;

                                    // 2. Get Public URL
                                    const { data: { publicUrl } } = supabase.storage
                                        .from('receipts')
                                        .getPublicUrl(fileName);

                                    // 3. Insert into Database
                                    const { error: dbError } = await supabase
                                        .from('payment_requests')
                                        .insert({
                                            user_id: user.id,
                                            receipt_url: publicUrl,
                                            status: 'pending'
                                        });

                                    if (dbError) throw dbError;

                                    toast.success("تم رفع الوصل بنجاح! سيتم مراجعته قريباً", { id: toastId });
                                } catch (err) {
                                    console.error(err);
                                    toast.error("فشل في رفع الوصل", { id: toastId });
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                        />
                        <div className="border md:border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center group-hover:bg-white/5 transition-colors">
                            <UploadCloud className="text-white/40 mb-2 group-hover:text-blue-400 transition-colors" size={32} />
                            <span className="text-sm text-white/60 font-medium">اضغط لرفع الصورة</span>
                            <span className="text-[10px] text-white/30 mt-1">JPG, PNG only</span>
                        </div>
                    </div>
                </GlassCard>
            </div> // End of Grid

            {/* SECTION 2: AVAILABLE UPGRADES */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Star className="text-yellow-400" size={20} />
                    الباقات المتوفرة للترقية
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Access Card */}
                    <GlassCard className="p-6 relative group border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
                        <div className="absolute inset-0 bg-purple-600/5 group-hover:bg-purple-600/10 transition-colors gpu-accelerated" />
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform">
                                <Zap className="text-purple-400 fill-purple-400/20" size={24} />
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-2">الباقة الشاملة</h4>
                            <p className="text-white/60 text-sm mb-6 flex-1">وصول كامل لجميع الدروس المسجلة، الملخصات، بنك التمارين، والاختبارات التجريبية.</p>
                            <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:border-purple-500 gpu-accelerated">
                                ترقية الآن
                                <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </GlassCard>

                    {/* Teacher VIP Card */}
                    <GlassCard className="p-6 relative group border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300">
                        <div className="absolute inset-0 bg-yellow-600/5 group-hover:bg-yellow-600/10 transition-colors gpu-accelerated" />
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform">
                                <Crown className="text-yellow-400 fill-yellow-400/20" size={24} />
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-2">باقة الأستاذ VIP</h4>
                            <p className="text-white/60 text-sm mb-6 flex-1">متابعة شخصية من الأساتذة، حصص مباشرة أسبوعية.</p>
                            <button className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] gpu-accelerated">
                                اشتراك VIP
                            </button>
                        </div>
                    </GlassCard>
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
                                        <td colSpan={6} className="p-8 text-center text-white/40">
                                            جاري تحميل السجل...
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
