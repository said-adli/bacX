"use client";

import { useEffect, useState } from "react";
import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import { Lock, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";
import { PremiumLockScreen } from "@/components/dashboard/PremiumLockScreen";

// Subject shape from database
interface Subject {
    id: string;
    name: string;
    icon?: string;
}

// Lesson shape from database
interface Lesson {
    id: string;
    title: string;
    video_url: string | null;
    duration: string;
    is_free?: boolean;
    order?: number;
    isOwned?: boolean;
}

interface SubjectViewProps {
    subject: Subject;
    lessons: Lesson[];
    isSubscribed: boolean;
}

export default function SubjectView({ subject, lessons, isSubscribed }: SubjectViewProps) {
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    // Set initial lesson
    useEffect(() => {
        if (lessons?.length > 0 && !activeLessonId) {
            setActiveLessonId(lessons[0].id);
        }
    }, [lessons, activeLessonId]);

    const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

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
                        {(isSubscribed || activeLesson.isOwned || activeLesson.is_free) && activeLesson.video_url ? ( // Check ownership
                            // AUTHORIZED
                            <EncodedVideoPlayer encodedVideoId={activeLesson.video_url} />
                        ) : (
                            // GATEKEPT
                            <PremiumLockScreen />
                        )}
                    </div>

                    {/* Active Lesson Info */}
                    <div className="p-4 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
                                {activeLesson.isOwned && (
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">
                                        مملوكة
                                    </span>
                                )}
                            </div>
                            <p className="text-white/50 text-sm">مدة الدرس: {activeLesson.duration}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Lesson List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white px-2">قائمة الدروس</h3>
                    <div className="space-y-2 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {lessons.map((lesson) => (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveLessonId(lesson.id)}
                                disabled={!isSubscribed && !lesson.is_free && !lesson.isOwned}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl text-right transition-all border
                                    ${activeLessonId === lesson.id
                                        ? "bg-blue-600/20 border-blue-500/50 text-white"
                                        : "bg-white/5 border-transparent hover:bg-white/10 text-white/70"
                                    }
                                    ${(!isSubscribed && !lesson.is_free && !lesson.isOwned) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                `}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                    ${activeLessonId === lesson.id ? "bg-blue-500 text-white" : "bg-white/10 text-white/50"}
                                `}>
                                    {(isSubscribed || lesson.is_free || lesson.isOwned) ? <PlayCircle size={20} /> : <Lock size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm line-clamp-1 truncate">{lesson.title}</h4>
                                        {lesson.isOwned && (
                                            <span className="shrink-0 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">
                                                مملوكة
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-white/30 flex items-center gap-1 mt-1">
                                        <Clock size={10} /> {lesson.duration}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
