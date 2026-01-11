"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import CinematicHero from "@/components/dashboard/CinematicHero";
import { CrystalSubjectCard } from "@/components/dashboard/CrystalSubjectCard";
import { SUBJECTS, NEWS, APPOINTMENTS } from "@/data/mockLibrary";
import { Clock, TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-16 animate-in fade-in zoom-in duration-700 pb-20">

            {/* 1. HERO SECTION (PLANET) */}
            <CinematicHero />

            {/* 2. STATS (Transparent Glass) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
                {[
                    { label: "الدورات المكتملة", value: "3", icon: Zap, color: "text-yellow-400" },
                    { label: "ساعات التعلم", value: "24.5", icon: Clock, color: "text-blue-400" },
                    { label: "الترتيب العام", value: "#12", icon: TrendingUp, color: "text-green-400" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-default">
                        <div>
                            <p className="text-sm text-white/40 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold font-serif">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. CRYSTAL GRID (Subjects) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-bold text-white">مسار التعلم</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SUBJECTS.slice(0, 6).map((subject) => (
                        <CrystalSubjectCard key={subject.id} subject={subject} />
                    ))}
                </div>
            </div>

            {/* 4. ADMIN FEED & APPOINTMENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* News Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-white px-2">آخر المستجدات</h2>
                    <div className="space-y-4">
                        {NEWS.map((item) => (
                            <GlassCard key={item.id} className="p-6 flex items-start gap-4 hover:bg-white/10 transition-colors group cursor-pointer border-white/5">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_10px_#3b82f6]" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-white/40">
                                        <span className="bg-white/5 px-2 py-0.5 rounded text-white/60">{item.category}</span>
                                        <span>•</span>
                                        <span>{item.date}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>

                {/* Live Countdown & Appointments */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white px-2">المواعيد القادمة</h2>
                    <GlassCard className="p-0 overflow-hidden border-white/5">
                        <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-6 text-center border-b border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                            <h3 className="text-sm text-blue-200 mb-2 relative z-10">الحصة المباشرة القادمة</h3>
                            <div className="text-3xl font-bold font-mono text-white relative z-10" dir="ltr">02:14:50</div>
                            <p className="text-xs text-blue-300/60 mt-2 relative z-10">الرياضيات • الأستاذ العمراني</p>
                        </div>
                        <div className="p-4 space-y-4">
                            {APPOINTMENTS.map((apt) => (
                                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 
                                        ${apt.type === 'live' ? 'bg-red-500/10 text-red-400' : 'bg-purple-500/10 text-purple-400'}
                                    `}>
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{apt.title}</h4>
                                        <p className="text-xs text-white/40" dir="ltr">{new Date(apt.timestamp).toLocaleDateString()} @ {new Date(apt.timestamp).getHours()}:00</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
}
