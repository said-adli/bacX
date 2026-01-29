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

const getSubjectConfig = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes('رياضيات') || normalized.includes('math')) {
        return { icon: Calculator, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'group-hover:border-blue-500/30' };
    }
    if (normalized.includes('فيزياء') || normalized.includes('physics')) {
        return { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'group-hover:border-yellow-500/30' };
    }
    if (normalized.includes('علوم') || normalized.includes('science')) {
        return { icon: Microscope, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'group-hover:border-emerald-500/30' };
    }
    if (normalized.includes('أدب') || normalized.includes('literature') || normalized.includes('عربية')) {
        return { icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'group-hover:border-purple-500/30' };
    }
    if (normalized.includes('فلسفة') || normalized.includes('philosophy')) {
        return { icon: Feather, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'group-hover:border-pink-500/30' };
    }
    if (normalized.includes('انجليزية') || normalized.includes('english')) {
        return { icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'group-hover:border-indigo-500/30' };
    }
    // Default
    return { icon: LayoutGrid, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'group-hover:border-slate-500/30' };
};

import { Calculator, Microscope, BookOpen, Feather, Globe, LayoutGrid } from "lucide-react";

// ... (Subject Interface)

export default function MaterialsClient() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAccessDenied, setIsAccessDenied] = useState(false);

    // ... (fetchSubjects and useEffect - Unchanged)
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
                        <div key={i} className="h-48 bg-white/5 rounded-2xl border border-white/5" />
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-serif font-bold text-white tracking-wide">المواد الدراسية</h1>
                <p className="text-white/50 text-lg">اختر مادة للوصول إلى الدروس والتمارين</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.length > 0 ? (
                    subjects.map((subject) => {
                        const config = getSubjectConfig(subject.name);
                        const Icon = config.icon;

                        return (
                            <Link key={subject.id} href={`/materials/${subject.id}`}>
                                <GlassCard className={`group h-full p-6 hover:bg-white/[0.08] transition-all duration-300 border-white/5 ${config.border} hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer flex flex-col justify-between min-h-[180px]`}>

                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                                            <Icon size={28} strokeWidth={1.5} />
                                        </div>

                                        {/* Hover Arrow */}
                                        <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                            <span className="text-white/40 group-hover:text-white text-xl">←</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">{subject.name}</h3>
                                        <p className="text-sm text-white/40 line-clamp-2 leading-relaxed mb-4">{subject.description}</p>

                                        <div className="flex items-center gap-4 text-xs font-medium text-white/40 pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                                            <span className="flex items-center gap-1.5">
                                                <div className={`w-1 h-1 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                                                {subject.unitCount} وحدات
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                                {subject.lessonCount} درس
                                            </span>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        );
                    })
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
