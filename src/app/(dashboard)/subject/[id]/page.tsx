"use client";

import { useAuth } from "@/context/AuthContext";
import { VideoCard } from "@/components/dashboard/VideoCard";
import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

// ============================================================================
// SUBJECT PAGE - NON-BLOCKING
// ============================================================================
// Auth is handled by middleware. Page renders immediately.
// Data fetches in useEffect. NO blocking if(loading) return.
// ============================================================================

interface Lesson {
    id: string;
    title: string;
    subject: string;
    instructor?: string;
    duration?: string;
    thumbnail?: string;
    videoUrl: string;
}

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const decodedSubject = decodeURIComponent(id);
    const { user } = useAuth();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchLessons() {
            const start = performance.now();

            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('lessons')
                    .select('*')
                    .eq('subject', decodedSubject)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    setLessons(data.map((doc) => ({
                        id: doc.id,
                        title: doc.title,
                        subject: doc.subject,
                        instructor: doc.instructor,
                        duration: doc.duration,
                        thumbnail: doc.thumbnail,
                        videoUrl: doc.video_url || doc.videoUrl,
                    })));
                }
            } catch (error) {
                console.error("Error fetching lessons:", error);
            } finally {
                const end = performance.now();
                const fetchTime = end - start;
                console.log(`[SUBJECT] FETCH_TIME: ${fetchTime.toFixed(0)}ms`);
                setLoading(false);
            }
        }
        fetchLessons();
    }, [user, decodedSubject, supabase]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">{decodedSubject}</span>
            </div>

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">مادة {decodedSubject}</h1>
                    <p className="text-muted-foreground">استكشف جميع الدروس والتمارين المتاحة لهذه المادة</p>
                </div>
                <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                    {loading ? "..." : `${lessons.length} درس`}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                // Skeleton grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-video bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : lessons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {lessons.map((video) => (
                        <VideoCard
                            key={video.id}
                            title={video.title}
                            subject={video.subject}
                            instructor={video.instructor || "Brainy Instructor"}
                            duration={video.duration || "20:00"}
                            thumbnail={video.thumbnail || `https://img.youtube.com/vi/${video.videoUrl}/hqdefault.jpg`}
                            href={`/video/${video.id}`}
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
