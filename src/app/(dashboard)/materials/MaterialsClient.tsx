"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Zap, AlertTriangle, RefreshCw, ShieldOff } from "lucide-react";

interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    unitCount: number;
    lessonCount: number;
}

export default function MaterialsClient() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAccessDenied, setIsAccessDenied] = useState(false);

    const fetchSubjects = async () => {
        setLoading(true);
        setError(null);
        setIsAccessDenied(false);

        try {
            const supabase = createClient();
            const { data, error: fetchError } = await supabase.from('subjects').select('*');

            // CRITICAL: Handle RLS/permission errors (Silent 403 fix)
            if (fetchError) {
                if (fetchError.code === '42501' || fetchError.code === 'PGRST301') {
                    setIsAccessDenied(true);
                    throw new Error("ACCESS_DENIED");
                }
                throw new Error(fetchError.message);
            }

            if (data) {
                setSubjects(data.map((s: any) => ({
                    ...s,
                    unitCount: s.unitCount || 0,
                    lessonCount: s.lessonCount || 0
                })));
            }
        } catch (e: any) {
            console.error("[MaterialsClient] Fetch error:", e);
            if (e.message !== "ACCESS_DENIED") {
                setError(e.message || "UNKNOWN_ERROR");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    // Access Denied State (RLS blocked)
    if (isAccessDenied) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <GlassCard className="p-12 text-center max-w-md mx-auto space-y-4 border-red-500/20">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 mx-auto flex items-center justify-center">
                        <ShieldOff className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">تم رفض الوصول</h2>
                    <p className="text-white/60">ليس لديك صلاحية للوصول إلى المواد الدراسية.</p>
                </GlassCard>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <GlassCard className="p-12 text-center max-w-md mx-auto space-y-4 border-yellow-500/20">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/10 mx-auto flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">خطأ في التحميل</h2>
                    <p className="text-white/60">حدث خطأ أثناء تحميل المواد الدراسية.</p>
                    <button
                        onClick={fetchSubjects}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 mx-auto transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        إعادة المحاولة
                    </button>
                </GlassCard>
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
