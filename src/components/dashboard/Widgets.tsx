"use client";

import { useEffect, useState } from "react";
import { Clock, TrendingUp, Bell, Video, Calendar, ArrowUpRight } from "lucide-react";
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
        <div className="bg-gradient-to-br from-black to-zinc-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[60px] rounded-full group-hover:bg-red-600/20 transition-all" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-zinc-400 text-sm font-medium mb-1">الوقت المتبقي للبكالوريا</h3>
                    <div className="text-3xl font-bold font-mono tracking-tight flex items-baseline gap-1">
                        <span className="text-white">{timeLeft.days}</span>
                        <span className="text-xs text-zinc-500 mr-2 font-sans">يوم</span>
                        <span className="text-white">{timeLeft.hours}</span>
                        <span className="text-xs text-zinc-500 mr-2 font-sans">ساعة</span>
                    </div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                    <Clock className="w-5 h-5" />
                </div>
            </div>

            <div className="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                {/* Visual filler - assuming 365 days total scale roughly */}
                <div className="bg-red-500 h-full rounded-full w-[45%]" />
            </div>
            <p className="text-xs text-zinc-500 mt-2 text-left">1 يونيو 2025</p>
        </div>
    );
}

// --- WIDGET: PROGRESS ---
export function ProgressWidget({ progress = 25 }: { progress?: number }) {
    return (
        <div className="bg-gradient-to-br from-black to-zinc-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full group-hover:bg-blue-600/20 transition-all" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-zinc-400 text-sm font-medium mb-1">نسبة إتمام المنهاج</h3>
                    <div className="text-3xl font-bold font-mono tracking-tight text-white">{progress}%</div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <TrendingUp className="w-5 h-5" />
                </div>
            </div>

            <div className="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-zinc-500 mt-2">واصل الاجتهاد، أنت في الطريق الصحيح!</p>
        </div>
    );
}

// --- WIDGET: ANNOUNCEMENTS ---
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
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                آخر الإعلانات
            </h3>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                    <div className="text-zinc-500 text-sm animate-pulse">جاري تحميل الإعلانات...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm bg-white/5 rounded-xl border border-dashed border-white/10">
                        لا توجد إعلانات جديدة حالياً
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-default">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] bg-white/10 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                                    {ann.createdAt?.toDate ? new Date(ann.createdAt.toDate()).toLocaleDateString('ar-MA') : "الآن"}
                                </span>
                                {ann.isImportant && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                            </div>
                            <p className="text-sm text-zinc-200 leading-relaxed font-medium">
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
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                اللايفات القادمة
            </h3>

            {lives.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 py-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                    <Calendar className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">لا توجد مواعيد حالياً</p>
                    <p className="text-xs opacity-50 mt-1">راجع الجدول لاحقاً</p>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {lives.map(live => (
                        <div key={live.id} className="min-w-[200px] bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-4 flex flex-col">
                            <div className="text-xs text-red-400 font-bold mb-1 uppercase tracking-wider">Moomkin Live</div>
                            <h4 className="font-bold text-white mb-2 line-clamp-1">{live.title}</h4>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-xs text-zinc-400">
                                    {live.date?.toDate ? new Date(live.date.toDate()).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }) : "Coming Soon"}
                                </span>
                                <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
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
