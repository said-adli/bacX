"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLessonVideoId } from "@/data/mockLibrary"; // Keep helper for now, or move to utils
import { useAuth } from "@/context/AuthContext";
import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";
import { PremiumLockScreen } from "@/components/dashboard/PremiumLockScreen";
import { createClient } from "@/utils/supabase/client";

export default function SubjectPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const supabase = createClient();

    const [subject, setSubject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubject = async () => {
            const { data, error } = await supabase
                .from('subjects')
                .select('*, lessons(*)')
                .eq('id', subjectId)
                .single();

            if (data) setSubject(data);
            setLoading(false);
        };
        fetchSubject();
    }, [subjectId]);

    // Auth & Gatekeeping
    const { user, profile } = useAuth();
    // Allow Admins or Subscribed Users
    const isSubscribed = profile?.role === 'admin' || profile?.is_subscribed === true;

    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    // Set initial lesson
    useEffect(() => {
        if (subject && subject.lessons?.length > 0 && !activeLessonId) {
            setActiveLessonId(subject.lessons[0].id);
        }
    }, [subject, activeLessonId]);

    if (loading) return <div className="p-10 text-center text-white/50">جاري التحميل...</div>;

    if (!subject) {
        return <div className="p-10 text-center text-white/50">المادة غير موجودة</div>;
    }

    const activeLesson = subject.lessons.find((l: any) => l.id === activeLessonId) || subject.lessons[0];

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
                            <PremiumLockScreen />
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
