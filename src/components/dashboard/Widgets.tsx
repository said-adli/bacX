"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Bell, Video, Calendar, ArrowUpRight, Target } from "lucide-react";
import { differenceInDays, differenceInHours, differenceInMinutes, format } from "date-fns";
import { ar } from "date-fns/locale";
import { createClient } from "@/utils/supabase/client";

// =============================================================================
// BAC COUNTDOWN — Sleek Minimalist Timer
// =============================================================================
// Move constant outside
const BAC_DATE = new Date("2025-06-01T08:00:00");

export function BacCountdown() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    // Calculate total days for progress
    const startDate = new Date("2024-09-01"); // Start of school year
    const totalDays = differenceInDays(BAC_DATE, startDate);
    const daysElapsed = differenceInDays(new Date(), startDate);
    const progressPercent = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            if (now > BAC_DATE) return;

            setTimeLeft({
                days: differenceInDays(BAC_DATE, now),
                hours: differenceInHours(BAC_DATE, now) % 24,
                minutes: differenceInMinutes(BAC_DATE, now) % 60
            });
        };

        tick();
        const interval = setInterval(tick, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="academic-card p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="icon-container">
                        <Target className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        البكالوريا 2025
                    </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                    {format(BAC_DATE, "d MMM", { locale: ar })}
                </span>
            </div>

            {/* Timer Display */}
            <div className="flex-1 flex items-center gap-4">
                <div className="text-center">
                    <div className="text-3xl font-semibold text-slate-800 tabular-nums">
                        {timeLeft.days}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">يوم</div>
                </div>
                <div className="text-slate-200 text-2xl font-light">:</div>
                <div className="text-center">
                    <div className="text-2xl font-medium text-slate-600 tabular-nums">
                        {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">ساعة</div>
                </div>
                <div className="text-slate-200 text-2xl font-light">:</div>
                <div className="text-center">
                    <div className="text-2xl font-medium text-slate-600 tabular-nums">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">دقيقة</div>
                </div>
            </div>

            {/* Thin Progress Bar */}
            <div className="mt-4">
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill bg-blue-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-400">التقدم في العام الدراسي</span>
                    <span className="text-[10px] font-medium text-slate-500">{Math.round(progressPercent)}%</span>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// PROGRESS WIDGET — Clean Stats
// =============================================================================
export function ProgressWidget({ progress = 35 }: { progress?: number }) {
    return (
        <div className="academic-card p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="icon-container-primary">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        التقدم العام
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex items-end gap-6">
                <div>
                    <div className="text-4xl font-semibold text-slate-800 tabular-nums">
                        {progress}
                        <span className="text-xl text-slate-400">%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">من المنهج مكتمل</p>
                </div>

                {/* Mini Stats */}
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">الدروس المشاهدة</span>
                        <span className="font-medium text-slate-600">24</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">التمارين المحلولة</span>
                        <span className="font-medium text-slate-600">67</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="progress-bar h-1.5">
                    <div
                        className="progress-bar-fill bg-emerald-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// ANNOUNCEMENTS FEED — Clean List
// =============================================================================
interface Announcement {
    id: string;
    content: string;
    createdAt: { toDate: () => Date };
    isImportant?: boolean;
}

export function AnnouncementsFeed() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3);

            if (data) {
                const mapped = data.map((d: any) => ({
                    id: d.id,
                    content: d.content,
                    createdAt: d.created_at ? { toDate: () => new Date(d.created_at) } : { toDate: () => new Date() },
                    isImportant: d.is_important
                }));
                // @ts-ignore - Adjusting types for compatibility
                setAnnouncements(mapped);
            }
            setLoading(false);
        };
        fetchAnnouncements();
    }, []);

    return (
        <div className="academic-card p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="icon-container">
                    <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">آخر الإعلانات</h3>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-slate-400">لا توجد إعلانات جديدة</p>
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div
                            key={ann.id}
                            className="p-4 rounded-lg bg-slate-50/50 border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {ann.content}
                                    </p>
                                    <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                                        {ann.createdAt?.toDate
                                            ? format(ann.createdAt.toDate(), "d MMM, HH:mm", { locale: ar })
                                            : "الآن"
                                        }
                                    </span>
                                </div>
                                {ann.isImportant && (
                                    <span className="shrink-0 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                        هام
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// =============================================================================
// UPCOMING LIVES — Horizontal Scroll
// =============================================================================
interface LiveSession {
    id: string;
    title: string;
    date: { toDate: () => Date };
}

export function UpcomingLives() {
    const [lives, setLives] = useState<LiveSession[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchLives = async () => {
            const { data } = await supabase
                .from('lives')
                .select('*')
                .gte('date', new Date().toISOString())
                .order('date', { ascending: true })
                .limit(5);

            if (data) {
                const mapped = data.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    date: d.date ? { toDate: () => new Date(d.date) } : { toDate: () => new Date() }
                }));
                // @ts-ignore
                setLives(mapped);
            }
        };
        fetchLives();
    }, []);

    return (
        <div className="academic-card p-5 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2.5 rounded-lg bg-red-50 text-red-500">
                    <Video className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">الحصص المباشرة القادمة</h3>
            </div>

            {/* Content */}
            {lives.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                        <Calendar className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400">لا توجد حصص مجدولة حالياً</p>
                    <p className="text-xs text-slate-300 mt-1">تابع الإعلانات للمواعيد الجديدة</p>
                </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {lives.map(live => (
                        <div
                            key={live.id}
                            className="min-w-[200px] p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-slate-200 transition-all hover:shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-subtle" />
                                <span className="text-[10px] font-medium text-red-500 uppercase tracking-wider">
                                    Live
                                </span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 line-clamp-2">
                                {live.title}
                            </h4>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <span className="text-xs text-slate-400 font-mono">
                                    {live.date?.toDate
                                        ? format(live.date.toDate(), "HH:mm", { locale: ar })
                                        : "قريباً"
                                    }
                                </span>
                                <button className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
