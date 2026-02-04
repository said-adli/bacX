"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle, Clock, Loader2 } from "lucide-react";
import { getLastAccessedLesson } from "@/actions/progress";
import { cn } from "@/lib/utils";

interface LastLesson {
    lesson_id: string;
    updated_at: string;
    lessons: {
        id: string;
        title: string;
        is_free: boolean;
        video_url: string | null;
        units: {
            id: string;
            title: string;
            subject_id: string;
            subjects: {
                id: string;
                name: string;
                color: string | null;
            };
        };
    };
}

// ... imports

interface ContinueWatchingProps {
    initialData?: LastLesson | null;
    userId: string;
}

export default function ContinueWatching({ initialData, userId }: ContinueWatchingProps) {
    const [data, setData] = useState<LastLesson | null>(initialData || null);
    const [isLoading, setIsLoading] = useState(!initialData);

    useEffect(() => {
        if (initialData) {
            setIsLoading(false);
            return;
        }

        const fetchLastLesson = async () => {
            if (!userId) return;
            try {
                const result = await getLastAccessedLesson(userId);
                if (result) {
                    setData(result as any);
                }
            } catch (e) {
                console.error("Failed to fetch last accessed lesson", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLastLesson();
    }, [initialData, userId]);

    // Hide completely if loading or no data
    if (isLoading) {
        return (
            <div className="w-full h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
            </div>
        );
    }

    // Format "last watched" time
    const [timeAgo, setTimeAgo] = useState<string>("");

    useEffect(() => {
        if (data?.updated_at) {
            const lastWatched = new Date(data.updated_at);
            setTimeAgo(getTimeAgo(lastWatched));
        }
    }, [data?.updated_at]);

    if (!data || !data.lessons) {
        return null; // Gracefully hide for new students
    }

    const lesson = data.lessons;
    const subject = lesson.units?.subjects;
    const subjectColor = subject?.color || "#3b82f6"; // Fallback to blue

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-lg font-bold text-white/80 mb-4 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-400" />
                متابعة المشاهدة
            </h2>

            <Link href={`/materials/${lesson.units?.subject_id}`}>
                <div
                    className={cn(
                        "relative overflow-hidden rounded-2xl border border-white/10 p-6 group cursor-pointer",
                        "bg-gradient-to-br from-white/5 to-white/[0.02]",
                        "hover:border-white/20 hover:shadow-xl transition-all duration-500"
                    )}
                    style={{
                        boxShadow: `0 0 60px ${subjectColor}15`,
                    }}
                >
                    {/* Accent Border */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{ backgroundColor: subjectColor }}
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                            {/* Subject Tag */}
                            <span
                                className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3"
                                style={{
                                    backgroundColor: `${subjectColor}20`,
                                    color: subjectColor,
                                }}
                            >
                                {subject?.name || "مادة"}
                            </span>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                                {lesson.title}
                            </h3>

                            <div className="flex items-center gap-3 text-sm text-white/50">
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {timeAgo || "..."}
                                </span>
                                {lesson.units && (
                                    <span className="text-white/30">
                                        • {lesson.units.title}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Play Button */}
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                            style={{
                                backgroundColor: `${subjectColor}20`,
                                boxShadow: `0 0 30px ${subjectColor}30`,
                            }}
                        >
                            <PlayCircle
                                size={32}
                                className="ml-0.5"
                                style={{ color: subjectColor }}
                            />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

// Helper: Human-readable time ago
function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString("ar-DZ");
}
