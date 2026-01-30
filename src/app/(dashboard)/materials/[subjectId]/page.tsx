"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    Clock,
    FileText,
    Layout,
    Loader2,
    Lock,
    PlayCircle,
    Video
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import { PremiumLockScreen } from "@/components/dashboard/PremiumLockScreen"; // Import Lock Screen

// --- Types ---
interface Lesson {
    id: string;
    title: string;
    duration: string | null;
    video_url: string | null;
    pdf_url: string | null;
    is_free: boolean;
    unit_id: string;
    created_at: string;
    required_plan_id?: string | null; // Granular Access
}

interface Unit {
    id: string;
    title: string;
    subject_id: string;
    created_at: string;
    lessons: Lesson[];
}

interface Subject {
    id: string;
    name: string;
    icon_url?: string | null;
    units: Unit[];
}

export default function SubjectDetailsPage() {
    const params = useParams();
    const subjectId = params?.subjectId as string;

    // State
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null); // For access control
    const [error, setError] = useState<string | null>(null);

    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

    // Supabase Client
    const supabase = createClient();

    // --- Data Fetching ---
    useEffect(() => {
        if (!subjectId) return;

        const fetchSubjectData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Validate ID format (basic UUID check)
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(subjectId)) {
                    console.error("❌ Invalid ID format received:", subjectId);
                    throw new Error(`Invalid ID format: "${subjectId}"`);
                }

                // 2. Fetch Hierarchy & User Profile

                // Parallel Fetch
                const [subjectResult, userResult] = await Promise.all([
                    supabase
                        .from('subjects')
                        .select('*, units(*, lessons(*))')
                        .eq('id', subjectId)
                        .single(),
                    supabase.auth.getUser().then(({ data }: { data: { user: any } }) =>
                        data.user ? supabase.from('profiles').select('*').eq('id', data.user.id).single() : { data: null }
                    )
                ]);

                if (subjectResult.error) {
                    if (subjectResult.error.code === 'PGRST116') {
                        throw new Error("Subject not found in Database");
                    }
                    throw subjectResult.error;
                }

                const data = subjectResult.data;
                setUserProfile(userResult.data); // Store profile

                if (!data) {
                    throw new Error("Subject not found in Database");
                }

                // 3. Format & Sort Data
                // Ensure lessons/units are sorted by created_at or sequence if available
                const formattedSubject: Subject = {
                    ...data,
                    units: (data.units || []).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((unit: any) => ({
                            ...unit,
                            lessons: (unit.lessons || []).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        }))
                };

                setSubject(formattedSubject);

                // 4. Set Initial State
                if (formattedSubject.units.length > 0) {
                    // Expand first unit
                    const firstUnit = formattedSubject.units[0];
                    setExpandedUnits(new Set([firstUnit.id]));

                    // Select first lesson if available
                    if (firstUnit.lessons.length > 0) {
                        setActiveLesson(firstUnit.lessons[0]);
                    }
                }

            } catch (err: any) {
                console.error("Fetch Error:", err);
                setError(err.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectData();

        // --- Realtime Subscription (Admin Panel Compatibility) ---
        // Listen for changes in units or lessons to refresh data
        // For simplicity, we re-fetch on any change related to this subject's units/lessons
        // Ideally we would listen to specific filters, but 'public' schema events work broadly.
        const channel = supabase.channel('subject-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'units', filter: `subject_id=eq.${subjectId}` }, () => {
                fetchSubjectData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => {
                // We'd ideally filter lessons by unit_id -> subject_id, but without complex filters, 
                // we can just re-fetch to be safe (client-side this is cheap for single user)
                fetchSubjectData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [subjectId]);

    // --- Helper Functions ---
    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => {
            const next = new Set(prev);
            if (next.has(unitId)) next.delete(unitId);
            else next.add(unitId);
            return next;
        });
    };

    // --- Render States ---

    // 1. Loading
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black/95">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-white/50 text-sm animate-pulse">جاري تحميل المادة...</p>
                </div>
            </div>
        );
    }

    // 2. Error
    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-black/95 p-4">
                <GlassCard className="max-w-md w-full p-8 border-red-500/20 text-center">
                    <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">حدث خطأ</h2>
                    <p className="text-white/60 mb-6">{error}</p>
                    <Link
                        href="/materials"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 w-full"
                    >
                        <ArrowLeft size={16} />
                        العودة للمواد
                    </Link>
                </GlassCard>
            </div>
        );
    }

    // 3. Success (Empty State?)
    if (!subject) return null; // Should be handled by error state, but typescript safety

    // 4. Access Check Helper
    const hasAccess = (lesson: Lesson) => {
        if (!userProfile) return false;
        if (userProfile.role === 'admin' || userProfile.role === 'super_admin') return true;
        if (lesson.is_free) return true;

        // Plan Check
        if (userProfile.is_subscribed) return true; // Full Access
        // Granular check if implemented: if (lesson.required_plan_id === userProfile.plan_id) ...

        return false;
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans" dir="rtl">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                    <Link
                        href="/materials"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                {subject.name}
                            </h1>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                                {subject.units.length} وحدات
                            </span>
                        </div>
                        <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
                            <BookOpen size={14} />
                            تصفح الدروس والمحتوى التعليمي
                        </p>
                    </div>
                </div>

                {/* Progress Bar (Mockup for Visual) */}
                <div className="w-full md:w-64">
                    <div className="flex justify-between text-xs text-white/50 mb-2">
                        <span>نسبة الإنجاز</span>
                        <span>0%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-[0%] rounded-full" />
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Left: Video Area (Taking up 8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="relative w-full aspect-video bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center group">
                        {activeLesson ? (
                            hasAccess(activeLesson) ? (
                                activeLesson.video_url ? (
                                    <EncodedVideoPlayer
                                        encodedVideoId={activeLesson.video_url}
                                    />
                                ) : (
                                    <div className="text-center p-8">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Lock className="w-8 h-8 text-white/30" />
                                        </div>
                                        <p className="text-white/50">لا يوجد فيديو لهذا الدرس</p>
                                    </div>
                                )
                            ) : (
                                <PremiumLockScreen />
                            )
                        ) : (
                            <div className="text-center p-8">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Video className="w-8 h-8 text-white/30" />
                                </div>
                                <p className="text-white/50">اختر درساً للبدء</p>
                            </div>
                        )}
                    </div>

                    {/* Active Lesson Details */}
                    {activeLesson && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{activeLesson.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-white/50">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} className="text-blue-400" />
                                            {activeLesson.duration || "غير محدد"}
                                        </div>
                                        {/* Add more metadata if needed */}
                                    </div>
                                </div>
                                {activeLesson.pdf_url && (
                                    <a
                                        href={activeLesson.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg transition-colors border border-blue-600/20 text-sm font-medium"
                                    >
                                        <FileText size={18} />
                                        تحميل PDF
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Units List (Taking up 4 cols) */}
                <div className="lg:col-span-4 flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Layout size={20} className="text-white/60" />
                            محتوى المادة
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {subject.units.length > 0 ? (
                            subject.units.map((unit) => (
                                <div key={unit.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/5">
                                    <button
                                        onClick={() => toggleUnit(unit.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-right"
                                    >
                                        <span className="font-bold text-white/90">{unit.title}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-1 bg-black/40 rounded-md text-white/50">
                                                {unit.lessons.length}
                                            </span>
                                            {/* Chevron could go here */}
                                        </div>
                                    </button>

                                    {/* Lessons List */}
                                    {expandedUnits.has(unit.id) && (
                                        <div className="bg-black/20 border-t border-white/5 p-2 space-y-1">
                                            {unit.lessons.length > 0 ? (
                                                unit.lessons.map((lesson) => (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => setActiveLesson(lesson)}
                                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-right transition-all group
                                                            ${activeLesson?.id === lesson.id
                                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                : 'hover:bg-white/5 text-white/70 border border-transparent'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
                                                            ${activeLesson?.id === lesson.id ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'}
                                                            ${!hasAccess(lesson) ? 'bg-red-500/10 text-red-400' : ''}
                                                        `}>
                                                            {hasAccess(lesson) ? (
                                                                <PlayCircle size={16} className={activeLesson?.id === lesson.id ? "fill-blue-500/20" : ""} />
                                                            ) : (
                                                                <Lock size={14} className="opacity-80" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium truncate">{lesson.title}</p>
                                                            <p className="text-[10px] text-white/30 truncate mt-0.5">{lesson.duration || "00:00"}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-xs text-white/30">
                                                    لا توجد دروس
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-white/30">
                                لا توجد وحدات
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
