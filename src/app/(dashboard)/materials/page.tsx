"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    unitCount: number;
    lessonCount: number;
}

export default function MaterialsPage() {
    const supabase = createClient();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubjects() {
            try {
                // Fetch subjects (assuming unitCount/lessonCount logic exists or we mock it for now based on relations)
                // For V24 Polish: If no counts in DB, default to 0.
                const { data } = await supabase.from('subjects').select('*');
                if (data) {
                    setSubjects(data.map((s: any) => ({
                        ...s,
                        unitCount: s.unitCount || 0,
                        lessonCount: s.lessonCount || 0
                    })));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchSubjects();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-20 w-1/3 bg-white/5 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white/5 rounded-2xl border border-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-serif font-bold text-white tracking-wide">المواد الدراسية</h1>
                <p className="text-white/50 text-lg">اختر مادة للوصول إلى الدروس والتمارين</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {subjects.length > 0 ? (
                    subjects.map((subject) => (
                        <Link key={subject.id} href={`/materials/${subject.id}`}>
                            <GlassCard className="group h-full p-0 overflow-hidden hover:bg-white/10 transition-all duration-300 border-white/5 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer relative">

                                {/* Colorful Gradient Header */}
                                <div className={`h-32 w-full bg-gradient-to-br ${getGradient(subject.color)} relative overflow-hidden flex items-center justify-center`}>
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                                    <span className="text-6xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{subject.icon}</span>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1 group-hover:text-blue-400 transition-colors">{subject.name}</h3>
                                        <p className="text-sm text-white/40 line-clamp-2">{subject.description}</p>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-medium text-white/60 pt-2 border-t border-white/5">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            {subject.unitCount} وحدات
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            {subject.lessonCount} درس
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Reveal Arrow */}
                                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                    <span className="text-blue-400">←</span>
                                </div>
                            </GlassCard>
                        </Link>
                    ))
                ) : (
                    // Empty State Card
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center opacity-50">
                        <Zap size={64} className="text-white/20 mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">المحتوى قادم قريباً</h3>
                        <p className="text-white/50">بإشراف الدكتور سعيد</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function getGradient(color: string) {
    switch (color) {
        case 'blue': return "from-blue-600/40 to-cyan-600/40";
        case 'purple': return "from-purple-600/40 to-pink-600/40";
        case 'green': return "from-emerald-600/40 to-teal-600/40";
        case 'emerald': return "from-green-600/40 to-emerald-600/40";
        case 'orange': return "from-orange-600/40 to-amber-600/40";
        case 'red': return "from-red-600/40 to-rose-600/40";
        default: return "from-blue-600/40 to-indigo-600/40";
    }
}
