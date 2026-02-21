"use client";

import { motion } from "framer-motion";
import { MonitorPlay, BarChart2, Gamepad2, ChevronLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

const FEATURES = [
    {
        icon: MonitorPlay,
        title: "جودة سينمائية 4K",
        description: "تجربة مشاهدة فائقة الوضوح تجعل كل درس متعة بصرية، مع اهتمام دقيق بالتفاصيل الهندسية والعلمية.",
        color: "from-blue-500 to-indigo-500"
    },
    {
        icon: BarChart2,
        title: "إحصائيات ذكية",
        description: "لوحة تحكم متطورة تتبع تقدمك بدقة، تحلل نقاط قوتك وضعفك، وتوجهك نحو التحسين المستمر.",
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: Gamepad2,
        title: "بيئة تفاعلية",
        description: " نظام تنافسي ممتع (Gamification) يحول المذاكرة إلى رحلة شيقة مليئة بالتحديات والمكافآت.",
        color: "from-emerald-500 to-teal-500"
    }
];

export default function ProductPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white font-tajawal pt-28 pb-20 relative overflow-hidden" dir="rtl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[10px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[10px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* 1. Hero Section */}
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-6">
                        تعرف على المنصة
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50 leading-tight">
                        تكنولوجيا تعليمية <br className="hidden md:block" />
                        <span className="text-blue-500">سابقة لعصرها</span>
                    </h1>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
                        لقد أعدنا تصميم تجربة التعلم من الصفر. Brainy ليست مجرد منصة دروس،
                        بل هي نظام بيئي متكامل مصمم خصيصاً ليمنحك التفوق.
                    </p>
                </div>

                {/* 2. Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <GlassCard className="p-8 h-full border-white/5 bg-black/40 hover:bg-black/60 transition-colors group relative overflow-hidden">
                                {/* Hover Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-white/50 leading-relaxed">
                                    {feature.description}
                                </p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <Link
                        href="/auth/signup"
                        className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        <span>ابدأ رحلتك مجاناً</span>
                        <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
