"use client";

import { useEffect, useState } from "react";
// import { getLessonVideoId } from "@/data/mockLibrary"; 
import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, PlayCircle, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { PremiumLockScreen } from "@/components/dashboard/PremiumLockScreen";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import { markLessonComplete, getUserProgress } from "@/actions/progress";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface SubjectViewProps {
    subject: any;
    units: any[];
    isSubscribed: boolean;
}

export default function SubjectView({ subject, units, isSubscribed }: SubjectViewProps) {
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
    const router = useRouter();

    // Flatten all lessons for easy access
    const allLessons = units?.flatMap(u => u.lessons || []) || [];

    // Realtime Content Sync
    useEffect(() => {
        const supabase = createClient();

        const channel = supabase.channel('content-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => {
                toast.info("Updating course structure...");
                router.refresh();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => {
                toast.info("Content updated");
                router.refresh();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [router]);

    // Set initial lesson and expand first unit
    useEffect(() => {
        if (units?.length > 0 && expandedUnits.size === 0) { // Only if not already expanded
            // Expand first unit by default
            setExpandedUnits(new Set([units[0].id]));

            // Set active lesson to first lesson of first unit
            if (units[0].lessons?.length > 0 && !activeLessonId) {
                setActiveLessonId(units[0].lessons[0].id);
            }
        }
    }, [units]);

    // Realtime Content Sync
    useEffect(() => {
        const supabase = createClient();
        const router = require("next/navigation").useRouter(); // Dynamic require or just import?
        // Actually imports are at top. I will use the hook I likely imported or need to import.

        const channel = supabase.channel('content-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => {
                toast.info("Updating course structure...");
                router.refresh();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => {
                // specific lesson updates might not need full refresh if we optimized, 
                // but for "INSTANT" and "Sync", refresh is safest key.
                toast.info("Content updated");
                router.refresh();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, []); // Empty dep to run once on mount

    // Fetch Progress
    useEffect(() => {
        if (!subject.id) return;
        getUserProgress(subject.id).then((progress) => {
            const completed = new Set(progress.filter((p: any) => p.is_completed).map((p: any) => p.lesson_id));
            setCompletedLessonIds(completed);
        });
    }, [subject.id]);

    const handleLessonCompleted = async () => {
        if (!activeLessonId) return;

        // Optimistic UI Update
        setCompletedLessonIds(prev => new Set(prev).add(activeLessonId));
        toast.success("تم إكمال الدرس! 🎉");

        await markLessonComplete(activeLessonId);
    };

    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => {
            const next = new Set(prev);
            if (next.has(unitId)) next.delete(unitId);
            else next.add(unitId);
            return next;
        });
    };

    const activeLesson = allLessons.find((l: any) => l.id === activeLessonId) || allLessons[0];

    // Safety: If no lesson found (empty list?), handle it
    if (!activeLesson) {
        return <div className="p-10 text-center text-white/50">لا توجد دروس متاحة حالياً.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/materials" className="text-white/50 hover:text-white transition-colors">← العودة</Link>
                <h1 className="text-3xl font-serif font-bold text-white">{subject.name}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Player (or Gate) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* PLAYER CONTAINER */}
                    <div className="w-full aspect-video rounded-2xl overflow-hidden glass-panel relative border border-white/10 shadow-2xl">
                        {isSubscribed && activeLesson.video_url ? ( // Check video_url presence too
                            // AUTHORIZED
                            <EncodedVideoPlayer
                                encodedVideoId={activeLesson.video_url || ""}
                                onEnded={handleLessonCompleted}
                            />
                        ) : (
                            // GATEKEPT
                            <PremiumLockScreen />
                        )}
                    </div>

                    {/* PDF Download Button - Moved Here directly under player */}
                    {activeLesson.pdf_url && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <a
                                href={activeLesson.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                            >
                                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                                    <FileText size={20} className="text-blue-400" />
                                </div>
                                <div className="text-right">
                                    <span className="block text-white font-bold">ملف الدرس (PDF)</span>
                                    <span className="text-xs text-white/50">اضغط للتحميل والمتابعة</span>
                                </div>
                            </a>
                        </div>
                    )}

                    {/* Active Lesson Info */}
                    <div className="p-4 flex flex-col justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{activeLesson.title}</h2>
                            <p className="text-white/50 text-sm flex items-center gap-2">
                                <Clock size={14} />
                                مدة الدرس: {activeLesson.duration}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Lesson List (Split into Sections) */}
                {/* Right Column: Units List */}
                <div className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {units.map((unit) => (
                        <div key={unit.id} className="border border-white/5 rounded-xl overflow-hidden bg-white/5">
                            {/* Unit Header */}
                            <button
                                onClick={() => toggleUnit(unit.id)}
                                className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-white/5 transition-colors"
                            >
                                <h3 className="font-bold text-white">{unit.title}</h3>
                                <span className="text-xs text-white/30 bg-white/10 px-2 py-0.5 rounded-full">
                                    {unit.lessons?.length || 0} درس
                                </span>
                            </button>

                            {/* Unit Lessons */}
                            {expandedUnits.has(unit.id) && (
                                <div className="border-t border-white/5 p-2 space-y-1 bg-black/20">
                                    {unit.lessons?.map((lesson: any) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setActiveLessonId(lesson.id)}
                                            disabled={!isSubscribed && !lesson.is_free}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-right transition-all
                                                ${activeLessonId === lesson.id
                                                    ? "bg-blue-600/20 text-blue-200"
                                                    : "hover:bg-white/5 text-white/70"
                                                }
                                                ${!isSubscribed ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                                            `}
                                        >
                                            <div className="shrink-0">
                                                {completedLessonIds.has(lesson.id) ? (
                                                    <CheckCircle size={16} className="text-green-400" />
                                                ) : activeLessonId === lesson.id ? (
                                                    <PlayCircle size={16} className="text-blue-400" />
                                                ) : (
                                                    isSubscribed || lesson.is_free ? <PlayCircle size={16} /> : <Lock size={14} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{lesson.title}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-white/30">
                                                    <span>{lesson.duration}</span>
                                                    {lesson.type === 'exercise' && <span className="text-purple-400">تمرين</span>}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {(!unit.lessons || unit.lessons.length === 0) && (
                                        <div className="p-4 text-center text-xs text-white/20">
                                            لا توجد دروس في هذه الوحدة
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {units.length === 0 && (
                        <div className="p-8 text-center text-white/30 border border-dashed border-white/10 rounded-xl">
                            لا توجد وحدات دراسية مضافة حتى الآن.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
