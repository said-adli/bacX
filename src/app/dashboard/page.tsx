"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Clock, Calendar, Bell, Radio, ExternalLink } from "lucide-react";
import Link from "next/link";
import { differenceInDays, differenceInHours, format } from "date-fns";
import { ar } from "date-fns/locale";
import { collection, query, orderBy, limit, onSnapshot, doc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// =============================================================================
// ENTERPRISE DASHBOARD — THE 4 PILLARS
// =============================================================================
export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* PILLAR 1: THE HERO — Arabic Poem */}
            <PoemHero />

            {/* PILLAR 2: THE TIMELINE — BAC Roadmap */}
            <BacRoadmap />

            {/* PILLAR 3: THE AGENDA — Weekly Program */}
            <WeeklyProgram />

            {/* PILLAR 4: THE NEWSROOM — Announcements & Lives */}
            <Newsroom />

        </div>
    );
}

// =============================================================================
// PILLAR 1: THE HERO — Elegant Arabic Poem
// =============================================================================
function PoemHero() {
    return (
        <section className="quote-block">
            <p className="quote-text">
                العِلمُ يَرفَعُ بَيْتاً لا عِمادَ لَهُ<br />
                والجَهلُ يَهدِمُ بَيْتَ العِزِّ والشَّرَفِ
            </p>
            <p className="quote-author">— الإمام علي بن أبي طالب</p>
        </section>
    );
}

// =============================================================================
// PILLAR 2: THE TIMELINE — BAC Countdown Roadmap
// =============================================================================
function BacRoadmap() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
    const bacDate = new Date("2025-06-01T08:00:00");
    const startDate = new Date("2024-09-01");

    const totalDays = differenceInDays(bacDate, startDate);
    const daysElapsed = differenceInDays(new Date(), startDate);
    const progressPercent = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTimeLeft({
                days: Math.max(0, differenceInDays(bacDate, now)),
                hours: Math.max(0, differenceInHours(bacDate, now) % 24)
            });
        };
        tick();
        const interval = setInterval(tick, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="panel">
            <div className="panel-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="panel-title">الخط الزمني للبكالوريا 2025</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                    {format(bacDate, "d MMMM yyyy", { locale: ar })}
                </span>
            </div>

            <div className="panel-body">
                {/* Countdown Display */}
                <div className="flex items-center gap-8 mb-6">
                    <div>
                        <div className="metric-value">{timeLeft.days}</div>
                        <div className="metric-label">يوم متبقي</div>
                    </div>
                    <div className="text-4xl font-light text-slate-200">:</div>
                    <div>
                        <div className="text-3xl font-semibold text-slate-600">{timeLeft.hours}</div>
                        <div className="metric-label">ساعة</div>
                    </div>

                    <div className="flex-1" />

                    <div className="text-left">
                        <div className="text-2xl font-semibold text-slate-700">{Math.round(progressPercent)}%</div>
                        <div className="text-xs text-slate-400">من السنة الدراسية</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="progress h-2">
                    <div
                        className="progress-fill bg-slate-800"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Timeline Markers */}
                <div className="flex justify-between mt-3 text-xs text-slate-400">
                    <span>سبتمبر 2024</span>
                    <span>الآن</span>
                    <span>جوان 2025</span>
                </div>
            </div>
        </section>
    );
}

// =============================================================================
// PILLAR 3: THE AGENDA — Weekly Study Program
// =============================================================================
const weeklySchedule = [
    { day: "الأحد", time: "17:00", subject: "الرياضيات", topic: "الدوال العددية - النهايات والاستمرارية" },
    { day: "الإثنين", time: "17:00", subject: "الفيزياء", topic: "الوحدة 1: التحولات النووية" },
    { day: "الثلاثاء", time: "18:00", subject: "العلوم", topic: "التركيب الضوئي والتنفس الخلوي" },
    { day: "الأربعاء", time: "17:00", subject: "الرياضيات", topic: "الأعداد المركبة والهندسة" },
    { day: "الخميس", time: "17:00", subject: "الفيزياء", topic: "الوحدة 2: الظواهر الكهربائية" },
    { day: "السبت", time: "10:00", subject: "مراجعة", topic: "حصة أسئلة وأجوبة مباشرة" },
];

function WeeklyProgram() {
    return (
        <section className="panel">
            <div className="panel-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="panel-title">البرنامج الأسبوعي</span>
                </div>
                <span className="badge badge-info">الأسبوع الحالي</span>
            </div>

            <div className="divide-y divide-slate-100">
                {weeklySchedule.map((item, index) => (
                    <div key={index} className="schedule-row px-6">
                        <div className="schedule-time">{item.time}</div>
                        <div className="w-20 text-xs font-medium text-slate-500">{item.day}</div>
                        <div className="schedule-content">{item.subject}</div>
                        <div className="flex-1 text-sm text-slate-400 truncate">{item.topic}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// =============================================================================
// PILLAR 4: THE NEWSROOM — Announcements & Live Sessions
// =============================================================================
interface Announcement {
    id: string;
    content: string;
    createdAt: { toDate: () => Date };
    priority?: 'high' | 'medium' | 'info';
}

interface LiveSession {
    id: string;
    title: string;
    date: { toDate: () => Date };
}

function Newsroom() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [lives, setLives] = useState<LiveSession[]>([]);
    const [isLiveNow, setIsLiveNow] = useState(false);

    useEffect(() => {
        // Announcements
        const announcementsQuery = query(
            collection(db, "announcements"),
            orderBy("createdAt", "desc"),
            limit(5)
        );
        const unsubAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
            setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
        });

        // Upcoming Lives
        const livesQuery = query(
            collection(db, "lives"),
            where("date", ">=", new Date()),
            orderBy("date", "asc"),
            limit(3)
        );
        const unsubLives = onSnapshot(livesQuery, (snapshot) => {
            setLives(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LiveSession)));
        });

        // Live Status
        const unsubLiveStatus = onSnapshot(doc(db, "app_settings", "global"), (doc) => {
            setIsLiveNow(doc.data()?.isLiveActive || false);
        });

        return () => {
            unsubAnnouncements();
            unsubLives();
            unsubLiveStatus();
        };
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Announcements */}
            <section className="panel">
                <div className="panel-header flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span className="panel-title">الإعلانات الرسمية</span>
                </div>

                <div className="divide-y divide-slate-50">
                    {announcements.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">
                            لا توجد إعلانات
                        </div>
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`badge ${ann.priority === 'high' ? 'badge-danger' :
                                            ann.priority === 'medium' ? 'badge-warning' :
                                                'badge-info'
                                        }`}>
                                        {ann.priority === 'high' ? 'عاجل' :
                                            ann.priority === 'medium' ? 'هام' : 'إعلام'}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">
                                        {ann.createdAt?.toDate
                                            ? format(ann.createdAt.toDate(), "d/MM HH:mm")
                                            : "—"
                                        }
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">{ann.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Live Sessions */}
            <section className="panel">
                <div className="panel-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-slate-400" />
                        <span className="panel-title">الحصص المباشرة</span>
                    </div>
                    {isLiveNow && (
                        <Link href="/live" className="badge badge-danger flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            مباشر الآن
                        </Link>
                    )}
                </div>

                <div className="divide-y divide-slate-50">
                    {lives.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">
                            لا توجد حصص مجدولة
                        </div>
                    ) : (
                        lives.map((live) => (
                            <div key={live.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{live.title}</p>
                                    <p className="text-xs text-slate-400 font-mono mt-1">
                                        {live.date?.toDate
                                            ? format(live.date.toDate(), "EEEE d MMMM، HH:mm", { locale: ar })
                                            : "قريباً"
                                        }
                                    </p>
                                </div>
                                <Link href="/live" className="btn btn-secondary text-xs">
                                    <ExternalLink className="w-3 h-3" />
                                    انضمام
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
