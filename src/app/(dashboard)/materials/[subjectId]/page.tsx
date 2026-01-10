"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SUBJECTS, getLessonVideoId } from "@/data/mockLibrary";
import { useAuth } from "@/context/AuthContext";
import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function SubjectPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const subject = SUBJECTS.find(s => s.id === subjectId);

    // Auth & Gatekeeping
    const { user, profile } = useAuth();
    // Assuming 'active' or 'is_subscribed' is the truth. 
    // Fallback to checking profile boolean if subscription object is missing in mock.
    const isSubscribed = profile?.is_subscribed === true;  // STRICT CHECK

    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    // Set initial lesson
    useEffect(() => {
        if (subject && subject.lessons.length > 0 && !activeLessonId) {
            setActiveLessonId(subject.lessons[0].id);
        }
    }, [subject, activeLessonId]);

    if (!subject) {
        return <div className="p-10 text-center text-white/50">المادة غير موجودة</div>;
    }

    const activeLesson = subject.lessons.find(l => l.id === activeLessonId) || subject.lessons[0];

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
                        {isSubscribed ? (
                            // AUTHORIZED
                            <EncodedVideoPlayer encodedVideoId={getLessonVideoId(activeLesson.id)} />
                        ) : (
                            // GATEKEPT
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-center p-8 z-20">
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/50">
                                    <Lock size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">محتوى حصري للمشتركين</h3>
                                <p className="text-white/60 mb-6 max-w-md">للوصول إلى دروس {subject.name} وباقي المواد، يرجى الاشتراك في الباقة المميزة.</p>
                                <Link href="/subscription" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                    اشترك الآن
                                </Link>
                            </div>
                        )}

                        {/* Fallback visual behind gate */}
                        {!isSubscribed && (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none" />
                        )}
                    </div>

                    {/* Active Lesson Info */}
                    <div className="p-4">
                        <h2 className="text-2xl font-bold text-white mb-1">{activeLesson.title}</h2>
                        <p className="text-white/50 text-sm">مدة الدرس: {activeLesson.duration}</p>
                    </div>
                </div>

                {/* Right Column: Lesson List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white px-2">قائمة الدروس</h3>
                    <div className="space-y-2 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {subject.lessons.map((lesson) => (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveLessonId(lesson.id)}
                                disabled={!isSubscribed}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl text-right transition-all border
                                    ${activeLessonId === lesson.id
                                        ? "bg-blue-600/20 border-blue-500/50 text-white"
                                        : "bg-white/5 border-transparent hover:bg-white/10 text-white/70"
                                    }
                                    ${!isSubscribed ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                `}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                    ${activeLessonId === lesson.id ? "bg-blue-500 text-white" : "bg-white/10 text-white/50"}
                                `}>
                                    {isSubscribed ? <PlayCircle size={20} /> : <Lock size={16} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm line-clamp-1">{lesson.title}</h4>
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
