"use client";

import { useAuth } from "@/context/AuthContext";
import { VideoCard } from "@/components/dashboard/VideoCard";
import { useState, useEffect, use } from "react";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LessonSkeleton } from "@/components/skeletons/LessonSkeleton";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Lesson {
    id: string;
    title: string;
    subject: string;
    instructor?: string;
    duration?: string;
    thumbnail?: string;
    videoUrl: string;
    createdAt: Timestamp;
}

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const decodedSubject = decodeURIComponent(id); // Handle Arabic URLs
    const { user, loading: authLoading } = useAuth();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLessons() {
            try {
                // Fetch lessons for this specific subject
                const q = query(
                    collection(db, "lessons"),
                    where("subject", "==", decodedSubject),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
                setLessons(data);
            } catch (error) {
                console.error("Error fetching lessons:", error);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchLessons();
        }
    }, [user, decodedSubject]);

    if (authLoading || loading) return <div className="p-8"><LessonSkeleton /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">{decodedSubject}</span>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">مادة {decodedSubject}</h1>
                    <p className="text-muted-foreground">استكشف جميع الدروس والتمارين المتاحة لهذه المادة</p>
                </div>
                <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                    {lessons.length} درس
                </div>
            </div>

            {lessons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {lessons.map((video) => (
                        <VideoCard
                            key={video.id}
                            title={video.title}
                            subject={video.subject}
                            instructor={video.instructor || "Brainy Instructor"}
                            duration={video.duration || "20:00"}
                            thumbnail={video.thumbnail || `https://img.youtube.com/vi/${video.videoUrl}/hqdefault.jpg`}
                            href={`/video/${video.id}`} // New Route
                            progress={0}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                    <p className="text-muted-foreground text-lg">لا توجد دروس متاحة في مادة {decodedSubject} حالياً.</p>
                </div>
            )}
        </div>
    );
}
