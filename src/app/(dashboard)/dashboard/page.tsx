"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-12 animate-in fade-in zoom-in duration-500">
            {/* Hero / Welcome Section */}
            <div className="flex flex-col items-center text-center space-y-8 py-10">
                <div className="space-y-2">
                    <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                        مرحباً بك، سعيد
                    </h1>
                    <p className="text-xl text-white/50 font-light">
                        جاهز لمواصلة رحلة التفوق؟
                    </p>
                </div>

                {/* Main CTA with Neon Glow */}
                <Link
                    href="/materials"
                    className="group relative inline-flex items-center gap-3 px-10 py-5 bg-blue-600 rounded-full text-xl font-bold text-white overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span>ابدأ رحلتك الآن</span>
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "الدورات المكتملة", value: "3", sub: "من أصل 12" },
                    { label: "ساعات التعلم", value: "24.5", sub: "هذا الشهر" },
                    { label: "النقاط المكتسبة", value: "850", sub: "مستوى متقدم" },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-6 flex flex-col gap-2 border-white/5">
                        <span className="text-sm text-white/40">{stat.label}</span>
                        <span className="text-4xl font-bold font-serif">{stat.value}</span>
                        <span className="text-xs text-white/30">{stat.sub}</span>
                    </GlassCard>
                ))}
            </div>

            {/* Recent Activity / Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">آخر الدروس</h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    ▶
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium group-hover:text-blue-400 transition-colors">مقدمة في الفيزياء الكمية</h4>
                                    <p className="text-xs text-white/40">الفصل الثالث • 45 دقيقة</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">الإعلانات</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-blue-200">
                                <span className="font-bold block mb-1">تذكير هام:</span>
                                موعد الحصة المباشرة القادمة يوم الأحد الساعة 8:00 مساءً.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm text-white/60">
                                تم تحديث محتوى مادة الرياضيات للفصل الثاني.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
