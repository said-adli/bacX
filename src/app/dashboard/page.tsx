"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Clock, Calendar, Bell, Radio, ChevronRight, Sparkles, BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { differenceInDays, format } from "date-fns";
import { ar } from "date-fns/locale";
import { collection, query, orderBy, limit, onSnapshot, doc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

// Animation variants
const container = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as "easeOut" } }
};

export default function DashboardPage() {
    const { user } = useAuth();
    const displayName = user?.displayName?.split(' ')[0] || 'طالب';

    return (
        <motion.div
            className="max-w-5xl mx-auto space-y-8"
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {/* PILLAR 1: Hero Area (Mesh Gradient & Poetry) */}
            <motion.div variants={item}>
                <HeroSection displayName={displayName} />
            </motion.div>

            {/* PILLAR 2: BAC Timeline Block */}
            <motion.div variants={item}>
                <TimelineBlock />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PILLAR 3: Study Agenda (Notion Style) */}
                <div className="lg:col-span-7 space-y-8">
                    <motion.div variants={item}>
                        <AgendaBlock />
                    </motion.div>
                </div>

                {/* PILLAR 4: Official Newsroom */}
                <div className="lg:col-span-5 space-y-8">
                    <motion.div variants={item}>
                        <NewsroomBlock />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// =============================================================================
// PILLAR 1: HERO SECTION
// =============================================================================
function HeroSection({ displayName }: { displayName: string }) {
    return (
        <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 bg-mesh-gradient-light dark:bg-mesh-gradient opacity-60 dark:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        مرحباً، {displayName}
                    </span>
                </div>

                <div className="space-y-4 max-w-2xl">
                    <p className="text-2xl md:text-4xl font-light leading-relaxed text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-slate-100 dark:to-slate-400 font-sans">
                        "العِلمُ يَرفَعُ بَيْتاً لا عِمادَ لَهُ<br />
                        والجَهلُ يَهدِمُ بَيْتَ العِزِّ والشَّرَفِ"
                    </p>
                    <p className="text-sm md:text-base text-slate-500 dark:text-amber-500/80 font-medium tracking-wide">
                        — الإمام علي بن أبي طالب
                    </p>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// PILLAR 2: TIMELINE BLOCK
// =============================================================================
function TimelineBlock() {
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const bacDate = new Date("2025-06-01T08:00:00");
    const startDate = new Date("2024-09-01"); // Academic year start

    useEffect(() => {
        setDaysLeft(Math.max(0, differenceInDays(bacDate, new Date())));
    }, []);

    // Skeleton
    if (daysLeft === null) {
        return (
            <div className="h-32 rounded-3xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        );
    }

    const totalDays = differenceInDays(bacDate, startDate);
    const daysElapsed = totalDays - daysLeft;
    const progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-glass border border-slate-200 dark:border-white/5 p-6 md:p-8 transition-all duration-300 hover:shadow-lg dark:hover:bg-glass-heavy">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">العد التنازلي للبكالوريا</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        تذكر أن كل دقيقة تستثمرها اليوم تقربك خطوة نحو حلمك
                    </p>
                </div>
                <div className="text-right">
                    <span className="block text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                        {daysLeft}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">يوم متبقي</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    className="absolute top-0 right-0 h-full bg-gradient-to-l from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                </motion.div>
            </div>

            <div className="flex justify-between mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                <span>سبتمبر 2024</span>
                <span>{Math.round(progress)}% مكتمل</span>
                <span>جوان 2025</span>
            </div>
        </div>
    );
}

// =============================================================================
// PILLAR 3: AGENDA BLOCK
// =============================================================================
const weeklySchedule = [
    { day: "الأحد", time: "17:00", subject: "الرياضيات", topic: "الدوال العددية", status: "upcoming", color: "blue" },
    { day: "الإثنين", time: "17:00", subject: "الفيزياء", topic: "التحولات النووية", status: "upcoming", color: "purple" },
    { day: "الثلاثاء", time: "18:00", subject: "العلوم", topic: "التركيب الضوئي", status: "completed", color: "green" },
    { day: "الأربعاء", time: "17:00", subject: "الرياضيات", topic: "الأعداد المركبة", status: "upcoming", color: "blue" },
    { day: "الخميس", time: "17:00", subject: "الفيزياء", topic: "الظواهر الكهربائية", status: "upcoming", color: "purple" },
];

function AgendaBlock() {
    return (
        <div className="rounded-3xl bg-white dark:bg-glass border border-slate-200 dark:border-white/5 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">جدول الأسبوع</h3>
                </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5">
                {weeklySchedule.map((item, index) => (
                    <div
                        key={index}
                        className="group p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 cursor-default"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-white/10 shadow-sm transition-colors">
                                <span className="text-xs font-bold">{item.day}</span>
                                <span className="text-[10px] opacity-70">{item.time}</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    {item.subject}
                                    <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{item.topic}</span>
                                </h4>
                            </div>
                        </div>

                        <div>
                            <span className={cn(
                                "hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                                item.status === 'completed'
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                    : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                            )}>
                                {item.status === 'completed' ? 'تمت المراجعة' : 'قادمة'}
                            </span>
                            <div className={cn(
                                "sm:hidden w-2 h-2 rounded-full",
                                item.status === 'completed' ? "bg-emerald-500" : "bg-blue-500"
                            )} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-white/5">
                <Link
                    href="/schedule"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                    عرض الجدول الكامل
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// PILLAR 4: NEWSROOM BLOCK
// =============================================================================
interface Announcement {
    id: string;
    content: string;
    createdAt: { toDate: () => Date };
}

interface LiveSession {
    id: string;
    title: string;
    date: { toDate: () => Date };
}

function NewsroomBlock() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [lives, setLives] = useState<LiveSession[]>([]);

    useEffect(() => {
        const announcementsQuery = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(3));
        const unsubAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
            setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
        });

        const livesQuery = query(collection(db, "lives"), where("date", ">=", new Date()), orderBy("date", "asc"), limit(2));
        const unsubLives = onSnapshot(livesQuery, (snapshot) => {
            setLives(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LiveSession)));
        });

        return () => { unsubAnnouncements(); unsubLives(); };
    }, []);

    return (
        <div className="space-y-6">
            {/* Live Sessions Card */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                            <Radio className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold">الحصص المباشرة</h3>
                    </div>

                    <div className="space-y-4">
                        {lives.length === 0 ? (
                            <p className="text-white/70 text-sm">لا توجد حصص مجدولة قريباً</p>
                        ) : (
                            lives.map((live) => (
                                <Link
                                    key={live.id}
                                    href="/live"
                                    className="flex items-start gap-4 p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors border border-white/10"
                                >
                                    <div className="flex-shrink-0 w-10 text-center">
                                        <div className="text-xs font-bold text-white/60 uppercase">
                                            {format(live.date.toDate(), "MMM", { locale: ar })}
                                        </div>
                                        <div className="text-lg font-bold">
                                            {format(live.date.toDate(), "d")}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm line-clamp-2 leading-snug">{live.title}</h4>
                                        <span className="text-xs text-white/60 mt-1 block">
                                            {format(live.date.toDate(), "HH:mm", { locale: ar })}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Announcements Card */}
            <div className="rounded-3xl bg-white dark:bg-glass border border-slate-200 dark:border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Bell className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">آخر المستجدات</h3>
                </div>

                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute top-2 bottom-2 right-[9px] w-[2px] bg-slate-100 dark:bg-white/10" />

                    <div className="space-y-6">
                        {announcements.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-4">لا توجد إعلانات</p>
                        ) : (
                            announcements.map((ann) => (
                                <div key={ann.id} className="relative flex gap-4 mr-0.5">
                                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-white dark:bg-[#020617] border-2 border-amber-500 z-10 mt-1" />
                                    <div className="flex-1 -mt-0.5">
                                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-1">
                                            {ann.content}
                                        </p>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), "d MMM، HH:mm", { locale: ar }) : "الآن"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
