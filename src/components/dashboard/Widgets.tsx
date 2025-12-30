"use client";

import { useEffect, useState } from "react";
import { Clock, TrendingUp, Bell, Video, Calendar, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- WIDGET: BAC COUNTDOWN ---
export function BacCountdown() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        const targetDate = new Date("2025-06-01T08:00:00"); // BAC 2025 Start

        const tick = () => {
            const now = new Date();
            if (now > targetDate) return;

            setTimeLeft({
                days: differenceInDays(targetDate, now),
                hours: differenceInHours(targetDate, now) % 24,
                minutes: differenceInMinutes(targetDate, now) % 60
            });
        };

        tick();
        const interval = setInterval(tick, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white/70 backdrop-blur-md border border-blue-100/50 rounded-2xl p-6 relative overflow-hidden group shadow-sm h-full flex flex-col justify-between">
            {/* Subtle Decorative Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 blur-[40px] rounded-full" />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1"><Clock className="w-4 h-4" /> البكالوريا</h3>
                    <div className="text-3xl font-bold font-mono tracking-tight flex items-baseline gap-1 text-slate-800">
                        <span>{timeLeft.days}</span>
                        <span className="text-xs text-slate-400 mr-2 font-sans font-normal">يوم</span>
                        <span className="text-slate-600 text-xl">{timeLeft.hours}</span>
                        <span className="text-xs text-slate-400 mr-2 font-sans font-normal">ساعة</span>
                    </div>
                </div>
            </div>

            <div className="w-full bg-blue-50 h-1.5 rounded-full overflow-hidden mt-4">
                <div className="bg-blue-500 h-full rounded-full w-[45%]" />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-left font-mono">01.06.2025</p>
        </div>
    );
}

// --- WIDGET: PROGRESS ---
export function ProgressWidget({ progress = 35 }: { progress?: number }) {
    return (
        <div className="bg-white/70 backdrop-blur-md border border-blue-100/50 rounded-2xl p-6 relative overflow-hidden group shadow-sm h-full flex flex-col justify-between">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/30 blur-[40px] rounded-full" />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> التقدم العام</h3>
                    <div className="text-3xl font-bold font-mono tracking-tight text-slate-800">{progress}%</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1">
                <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-emerald-600/80 font-medium">ممتاز! واصل على هذا المنوال.</p>
        </div>
    );
}

// --- WIDGET: ANNOUNCEMENTS ---
interface Announcement {
    id: string;
    content: string;
    createdAt: { toDate: () => Date }; // Firestore Timestamp
    isImportant?: boolean;
}

export function AnnouncementsFeed() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(3));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-white/70 backdrop-blur-md border border-blue-100/50 rounded-2xl p-6 h-full flex flex-col shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                <Bell className="w-5 h-5 text-blue-500" />
                آخر الإعلانات
            </h3>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                    <div className="text-slate-400 text-sm animate-pulse">جاري تحميل الإعلانات...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        لا توجد إعلانات جديدة حالياً
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="group p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-default">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">
                                    {ann.createdAt?.toDate ? new Date(ann.createdAt.toDate()).toLocaleDateString('ar-MA') : "الآن"}
                                </span>
                                {ann.isImportant && <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">هام</span>}
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                {ann.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// --- WIDGET: LIVE SESSIONS ---
interface LiveSession {
    id: string;
    title: string;
    date: { toDate: () => Date }; // Firestore Timestamp
}

export function UpcomingLives() {
    const [lives, setLives] = useState<LiveSession[]>([]);

    useEffect(() => {
        // Query for future lives
        const q = query(collection(db, "lives"), where("date", ">=", new Date()), orderBy("date", "asc"), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setLives(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LiveSession)));
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-white/70 backdrop-blur-md border border-blue-100/50 rounded-2xl p-6 h-full flex flex-col shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                <Video className="w-5 h-5 text-red-500" />
                اللايفات القادمة
            </h3>

            {lives.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
                    <p className="text-sm">لا توجد مواعيد حالياً</p>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {lives.map(live => (
                        <div key={live.id} className="min-w-[220px] bg-gradient-to-br from-red-50 to-white border border-red-100/50 rounded-xl p-4 flex flex-col shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Moomkin Live</div>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2 line-clamp-1">{live.title}</h4>
                            <div className="mt-auto flex items-center justify-between border-t border-red-100 pt-3">
                                <span className="text-xs text-slate-500 font-mono">
                                    {live.date?.toDate ? new Date(live.date.toDate()).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }) : "Coming Soon"}
                                </span>
                                <button className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
