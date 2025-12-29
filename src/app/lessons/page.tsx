"use client";

import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayCircle, Lock, Search, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LessonSkeleton } from "@/components/skeletons/LessonSkeleton";
import { useRouter, useSearchParams } from "next/navigation";

interface LessonSummary {
    id: string;
    title: string;
    subject: string;
    duration: string;
    createdAt: Timestamp; // More specific than any
    isLocked?: boolean;
}

export default function LessonsIndexPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [lessons, setLessons] = useState<LessonSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get("filter") || "All";
    const [filter, setFilter] = useState(initialFilter);

    useEffect(() => {
        if (!authLoading && !user) router.replace("/auth");
    }, [user, authLoading, router]);

    useEffect(() => {
        async function fetchLessons() {
            try {
                // Fetch all lessons (Limit 20 for V1)
                const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"), limit(20));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonSummary));
                setLessons(data);
            } catch (error) {
                console.error("Error fetching lessons:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLessons();
    }, []);

    const filteredLessons = filter === "All" ? lessons : lessons.filter(l => l.subject === filter);
    const subjects = ["All", "الرياضيات", "الفيزياء", "العلوم"];

    if (authLoading || loading) return <LessonSkeleton />; // Reusing skeleton (closely enough)

    return (
        <main className="min-h-screen bg-[#050505] p-6 pb-24 text-white font-tajawal">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">مكتبة الدروس</h1>
                        <p className="text-zinc-400 text-sm">تصفح أحدث الدروس المسجلة</p>
                    </div>
                </div>

                {/* Filter Tags */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setFilter(subject)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === subject
                                ? "bg-primary text-white"
                                : "bg-white/5 text-zinc-400 hover:bg-white/10"
                                }`}
                        >
                            {subject === "All" ? "الكل" : subject}
                        </button>
                    ))}
                </div>

                {/* Lessons Grid */}
                {filteredLessons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLessons.map((lesson) => (
                            <Link href={`/lessons/${lesson.id}`} key={lesson.id} className="group">
                                <GlassCard className="h-full overflow-hidden hover:border-primary/30 transition-colors">
                                    {/* Thumbnail Placeholder */}
                                    <div className="aspect-video bg-zinc-900 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                            {lesson.isLocked && !user?.email?.includes("admin") ? <Lock className="w-5 h-5" /> : <PlayCircle className="w-5 h-5 ml-0.5" />}
                                        </div>
                                        {/* Subject Badge */}
                                        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur text-xs font-medium text-white border border-white/10">
                                            {lesson.subject}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{lesson.title}</h3>
                                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {lesson.duration || "25 دقيقة"}
                                            </span>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-zinc-400 font-bold">لا توجد دروس حالياً</h3>
                        <p className="text-zinc-600 text-sm">حاول تغيير خيارات التصفية</p>
                    </div>
                )}
            </div>
        </main>
    );
}
