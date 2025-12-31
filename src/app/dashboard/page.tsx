"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Clock, Calendar, Bell, Radio, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { differenceInDays, differenceInHours, format } from "date-fns";
import { ar } from "date-fns/locale";
import { collection, query, orderBy, limit, onSnapshot, doc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Animation variants
const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
};

// =============================================================================
// NOTION-STYLE DASHBOARD
// =============================================================================
export default function DashboardPage() {
    const { user } = useAuth();
    const displayName = user?.displayName?.split(' ')[0] || 'طالب';

    return (
        <motion.div
            className="page-container py-8"
            initial="hidden"
            animate="visible"
            variants={stagger}
        >
            {/* Breadcrumb */}
            <motion.div variants={fadeIn} className="breadcrumb">
                <Link href="/" className="breadcrumb-link">الرئيسية</Link>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">لوحة التحكم</span>
            </motion.div>

            {/* Page Title */}
            <motion.div variants={fadeIn} className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                    مرحباً، {displayName} 👋
                </h1>
                <p className="text-[var(--foreground-secondary)] mt-1">
                    استمر في رحلة التفوق
                </p>
            </motion.div>

            {/* PILLAR 1: Poetry Block */}
            <motion.div variants={fadeIn}>
                <PoetryBlock />
            </motion.div>

            {/* PILLAR 2: BAC Timeline Block */}
            <motion.div variants={fadeIn}>
                <TimelineBlock />
            </motion.div>

            {/* PILLAR 3: Study Agenda (Database List) */}
            <motion.div variants={fadeIn}>
                <AgendaBlock />
            </motion.div>

            {/* PILLAR 4: Official Feed */}
            <motion.div variants={fadeIn}>
                <FeedBlock />
            </motion.div>
        </motion.div>
    );
}

// =============================================================================
// PILLAR 1: POETRY BLOCK
// =============================================================================
function PoetryBlock() {
    return (
        <div className="poetry-block">
            <Sparkles className="w-5 h-5 mx-auto mb-4 text-[var(--foreground-tertiary)]" />
            <p className="poetry-text">
                العِلمُ يَرفَعُ بَيْتاً لا عِمادَ لَهُ<br />
                والجَهلُ يَهدِمُ بَيْتَ العِزِّ والشَّرَفِ
            </p>
            <p className="poetry-author">— الإمام علي بن أبي طالب</p>
        </div>
    );
}

// =============================================================================
// PILLAR 2: TIMELINE BLOCK
// =============================================================================
function TimelineBlock() {
    // Initialize to null to detect first client-side render (prevents hydration mismatch)
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const bacDate = new Date("2025-06-01T08:00:00");
    const startDate = new Date("2024-09-01");

    const totalDays = differenceInDays(bacDate, startDate);

    useEffect(() => {
        const now = new Date();
        setDaysLeft(Math.max(0, differenceInDays(bacDate, now)));
    }, []);

    // Show skeleton during SSR and initial client render
    if (daysLeft === null) {
        return (
            <div className="block">
                <div className="block-header">
                    <Clock className="block-header-icon" />
                    <span>العد التنازلي</span>
                </div>
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-8 w-32 bg-slate-200 rounded" />
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full" />
                </div>
            </div>
        );
    }

    const daysElapsed = totalDays - daysLeft;
    const progressPercent = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

    return (
        <div className="block">
            <div className="block-header">
                <Clock className="block-header-icon" />
                <span>العد التنازلي</span>
            </div>

            <div className="flex items-center justify-between mb-3">
                <div>
                    <span className="text-3xl font-bold text-[var(--foreground)]">{daysLeft}</span>
                    <span className="text-[var(--foreground-secondary)] mr-2">يوم متبقي للبكالوريا</span>
                </div>
                <span className="text-sm text-[var(--foreground-tertiary)]">
                    {format(bacDate, "d MMMM yyyy", { locale: ar })}
                </span>
            </div>

            <div className="progress-pill">
                <div
                    className="progress-pill-fill"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="flex justify-between mt-2 text-xs text-[var(--foreground-tertiary)]">
                <span>سبتمبر 2024</span>
                <span>{Math.round(progressPercent)}% من السنة</span>
                <span>جوان 2025</span>
            </div>
        </div>
    );
}

// =============================================================================
// PILLAR 3: AGENDA BLOCK (Database List View)
// =============================================================================
const weeklySchedule = [
    { day: "الأحد", time: "17:00", subject: "الرياضيات", topic: "الدوال العددية", status: "upcoming" },
    { day: "الإثنين", time: "17:00", subject: "الفيزياء", topic: "التحولات النووية", status: "upcoming" },
    { day: "الثلاثاء", time: "18:00", subject: "العلوم", topic: "التركيب الضوئي", status: "completed" },
    { day: "الأربعاء", time: "17:00", subject: "الرياضيات", topic: "الأعداد المركبة", status: "upcoming" },
    { day: "الخميس", time: "17:00", subject: "الفيزياء", topic: "الظواهر الكهربائية", status: "upcoming" },
];

function AgendaBlock() {
    return (
        <div className="block">
            <div className="block-header">
                <Calendar className="block-header-icon" />
                <span>البرنامج الأسبوعي</span>
            </div>

            <div className="database-list">
                <div className="database-header">
                    <span>الوقت</span>
                    <span>المادة</span>
                    <span>الموضوع</span>
                    <span>الحالة</span>
                </div>

                {weeklySchedule.map((item, index) => (
                    <motion.div
                        key={index}
                        className="database-row"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="database-cell-secondary font-mono text-xs">
                            {item.time}
                        </div>
                        <div className="database-cell font-medium">
                            {item.subject}
                        </div>
                        <div className="database-cell-secondary">
                            {item.topic}
                        </div>
                        <div>
                            <span className={`database-tag ${item.status === 'completed' ? 'database-tag-green' : 'database-tag-blue'
                                }`}>
                                {item.status === 'completed' ? 'مكتمل' : 'قادم'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// PILLAR 4: FEED BLOCK
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

function FeedBlock() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [lives, setLives] = useState<LiveSession[]>([]);
    const [isLiveNow, setIsLiveNow] = useState(false);

    useEffect(() => {
        const announcementsQuery = query(
            collection(db, "announcements"),
            orderBy("createdAt", "desc"),
            limit(3)
        );
        const unsubAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
            setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
        });

        const livesQuery = query(
            collection(db, "lives"),
            where("date", ">=", new Date()),
            orderBy("date", "asc"),
            limit(2)
        );
        const unsubLives = onSnapshot(livesQuery, (snapshot) => {
            setLives(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LiveSession)));
        });

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Announcements */}
            <div className="block">
                <div className="block-header">
                    <Bell className="block-header-icon" />
                    <span>الإعلانات</span>
                </div>

                <div>
                    {announcements.length === 0 ? (
                        <p className="text-sm text-[var(--foreground-tertiary)] py-4">لا توجد إعلانات</p>
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann.id} className="feed-item">
                                <Bell className="feed-icon" />
                                <div className="feed-content">
                                    <p className="feed-title">{ann.content}</p>
                                    <span className="feed-meta">
                                        {ann.createdAt?.toDate
                                            ? format(ann.createdAt.toDate(), "d MMM، HH:mm", { locale: ar })
                                            : "الآن"
                                        }
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Live Sessions */}
            <div className="block">
                <div className="block-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Radio className="block-header-icon" />
                        <span>الحصص المباشرة</span>
                    </div>
                    {isLiveNow && (
                        <Link href="/live" className="flex items-center gap-1 text-xs text-red-500">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            مباشر الآن
                        </Link>
                    )}
                </div>

                <div>
                    {lives.length === 0 ? (
                        <p className="text-sm text-[var(--foreground-tertiary)] py-4">لا توجد حصص مجدولة</p>
                    ) : (
                        lives.map((live) => (
                            <Link key={live.id} href="/live" className="feed-item">
                                <Radio className="feed-icon" />
                                <div className="feed-content">
                                    <p className="feed-title">{live.title}</p>
                                    <span className="feed-meta">
                                        {live.date?.toDate
                                            ? format(live.date.toDate(), "EEEE، HH:mm", { locale: ar })
                                            : "قريباً"
                                        }
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
