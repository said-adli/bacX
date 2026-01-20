"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import CinematicHero from "@/components/dashboard/CinematicHero";
import { CrystalSubjectCard } from "@/components/dashboard/CrystalSubjectCard";
import { NEWS, APPOINTMENTS } from "@/data/mockLibrary"; // Keep News/Appointments mock for now
import { Clock, TrendingUp, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    unitCount: number;
    lessonCount: number;
    lessons: any[];
}

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q")?.toLowerCase() || "";
    const supabase = createClient();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // Fetch Subjects with Lessons count or join
                // For simplicity in display, we fetch basic info. 
                // Getting full lessons might be heavy, but let's try shallow or full if small app.
                const { data, error } = await supabase
                    .from('subjects')
                    .select('*, lessons(id, title)');

                if (data) setSubjects(data);
            } catch (error) {
                console.error("Error fetching content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const filteredSubjects = subjects.filter(s => {
        // Base Filter: Math & Physics ONLY (V18.0 Restriction)
        if (s.name !== "الرياضيات" && s.name !== "الفيزياء") return false;

        // Search Filter
        if (!query) return true;
        const matchesSubject = s.name.toLowerCase().includes(query);
        const matchesLesson = s.lessons?.some((l: any) => l.title.toLowerCase().includes(query));
        return matchesSubject || matchesLesson;
    });

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
                    <div key={i} className="glass-card p-6 flex items-center justify-between hover:bg-white/10 cursor-default">
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
                    <h2 className="text-2xl font-bold text-white">مسار التعلم {query && <span className="text-sm text-blue-400 font-normal">(نتائج البحث: {query})</span>}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. MATH & PHYSICS ONLY (Filtered) */}
                    {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((subject) => (
                            <CrystalSubjectCard key={subject.id} subject={subject} />
                        ))
                    ) : (
                        <div className="col-span-1 md:col-span-2 text-center py-12 text-white/30 border border-white/5 rounded-2xl bg-white/5">
                            لا توجد نتائج مطابقة لـ "{query}" داخل المواد المتاحة.
                        </div>
                    )}

                    {/* 2. PREMIUM CARD: FULL ACCESS */}
                    <GlassCard className="p-6 flex flex-col justify-between relative overflow-hidden group border-purple-500/30 hover:border-purple-500/60 transition-all duration-500">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-purple-600/5 group-hover:bg-purple-600/10 transition-colors duration-500" />
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform duration-500">
                                <Zap size={24} className="fill-current" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">الباقة الشاملة</h3>
                            <div className="text-sm text-purple-300 font-mono mb-4">FULL ACCESS</div>
                            <p className="text-sm text-white/60 mb-6">
                                وصول كامل لجميع الحصص المسجلة، الملخصات، والتمارين المكثفة لجميع المواد.
                            </p>
                        </div>

                        <button className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all relative z-10 group-hover:translate-y-[-2px]">
                            اشترك الآن
                        </button>
                    </GlassCard>

                    {/* 3. PREMIUM CARD: TEACHER VIP */}
                    <GlassCard className="p-6 flex flex-col justify-between relative overflow-hidden group border-blue-500/30 hover:border-blue-500/60 transition-all duration-500">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors duration-500" />
                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">اشتراك الأستاذ</h3>
                            <div className="text-sm text-blue-300 font-mono mb-4">TEACHER VIP</div>
                            <p className="text-sm text-white/60 mb-6">
                                متابعة شخصية مباشرة، حصص أسئلة وأجوبة أسبوعية، وتصحيح مفصل للمحاولات.
                            </p>
                        </div>

                        <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all relative z-10 group-hover:translate-y-[-2px]">
                            اشترك الآن
                        </button>
                    </GlassCard>
                </div>
            </div>

            {/* 4. ADMIN FEED & APPOINTMENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* News Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-white px-2">آخر المستجدات</h2>
                    <div className="space-y-4">
                        {NEWS.map((item) => (
                            <GlassCard key={item.id} className="p-6 flex items-start gap-4 hover:bg-white/10 transition-colors group cursor-pointer">
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
                    <GlassCard className="p-0 overflow-hidden">
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
