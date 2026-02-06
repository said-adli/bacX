"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Crown, Phone, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface PremiumLockScreenProps {
    price?: string;
    planName?: string;
    planId?: string;
    isPurchasable?: boolean;
    purchasePrice?: number | null;
    contentId?: string;
    contentType?: 'lesson' | 'subject';
}

export function PremiumLockScreen({
    price,
    planName = "الباقة الذهبية (VIP)",
    planId,
    isPurchasable,
    purchasePrice,
    contentId,
    contentType = 'lesson'
}: PremiumLockScreenProps) {
    return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm flex items-center justify-center p-6 group">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <GlassCard className="relative z-10 max-w-md text-center p-8 border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)] animate-pulse">
                    <Lock className="w-8 h-8 text-purple-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 font-serif">محتوى خاص بالمشتركين</h3>
                <p className="text-white/60 mb-6 text-sm leading-relaxed">
                    هذا الدرس متاح فقط لطلاب <span className="text-white font-bold">{planName}</span>. لتفعيل اشتراكك، يرجى الاشتراك الآن.
                </p>

                <div className="space-y-3">
                    {/* Subscription Option */}
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3 text-left dir-ltr">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                            <Crown size={16} />
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-xs text-purple-200 font-bold">{planName}</p>
                            <p className="text-[10px] text-purple-300/60">وصول كامل لجميع المواد</p>
                        </div>
                        {price && <div className="text-lg font-bold text-white">{price} <span className="text-xs font-normal opacity-50">دج</span></div>}
                    </div>

                    {planId ? (
                        <Link href={`/checkout/${planId}`} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                            اشترك الآن <ArrowUpRight size={16} />
                        </Link>
                    ) : (
                        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                            <Phone size={16} />
                            تواصل للتفعيل
                        </button>
                    )}

                    {/* Lifetime Purchase Option */}
                    {isPurchasable && purchasePrice && (
                        <div className="pt-3 mt-3 border-t border-white/10">
                            <div className="p-3 mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-left dir-ltr">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                                    <Lock size={16} className="text-emerald-400" />
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-xs text-emerald-200 font-bold">شراء هذا الدرس فقط</p>
                                    <p className="text-[10px] text-emerald-300/60">مدى الحياة</p>
                                </div>
                                <div className="text-lg font-bold text-white">{purchasePrice} <span className="text-xs font-normal opacity-50">دج</span></div>
                            </div>

                            <Link href={`/checkout/buy/${contentType}/${contentId}`} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                                شراء الدرس <ArrowUpRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
