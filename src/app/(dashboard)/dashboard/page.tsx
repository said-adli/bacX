"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import CinematicHero from "@/components/dashboard/CinematicHero";
import { CrystalSubjectCard } from "@/components/dashboard/CrystalSubjectCard";
import { Clock, TrendingUp, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Types
interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    lessons: any[];
}

interface Stats {
    courses: number;
    hours: number;
    rank: string;
}

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q")?.toLowerCase() || "";
    const supabase = createClient();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [stats, setStats] = useState<Stats>({ courses: 0, hours: 0, rank: "--" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Subjects
                const { data: subjectData } = await supabase
                    .from('subjects')
                    .select('*, lessons(id, title)');

                if (subjectData) setSubjects(subjectData);

                // 2. Fetch Stats (Real Counts)
                const { count: subjectCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true });
                // For "Hours", we'd sum durations. For now, zero or random placeholder if no real data.
                // Let's assume 0 if empty.
                const hours = 0;
                // Rank is user specific. Placeholder for now.

                setStats({
                    courses: subjectCount || 0,
                    hours: hours,
                    rank: "#--"
                });

            } catch (error) {
                console.error("Error fetching content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                    { label: "المواد المتاحة", value: stats.courses, icon: Zap, color: "text-yellow-400" },
                    { label: "ساعات التعلم", value: stats.hours, icon: Clock, color: "text-blue-400" },
                    { label: "الترتيب العام", value: stats.rank, icon: TrendingUp, color: "text-green-400" },
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

            {/* 4. CONTENT SECTIONS */}
            <div className="grid grid-cols-1 gap-8">
                {/* Empty State / Coming Soon for News */}
                <div className="p-8 border border-white/5 rounded-2xl bg-white/5 flex flex-col items-center justify-center text-center">
                    <Clock className="w-12 h-12 text-blue-400 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">المستجدات والمواعيد</h3>
                    <p className="text-white/40">سيتم نشر جداول الحصص المباشرة والاختبارات قريباً.</p>
                </div>
            </div>
        </div>
    );
}
