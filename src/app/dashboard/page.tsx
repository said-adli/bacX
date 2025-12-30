"use client";

import { useAuth } from "@/context/AuthContext";
import { VideoCard } from "@/components/dashboard/VideoCard";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LessonSkeleton } from "@/components/skeletons/LessonSkeleton"; // Reuse skeleton if available

const categories = ["الكل", "الرياضيات", "الفيزياء", "العلوم", "اللغات", "الفلسفة"];

interface Lesson {
    id: string;
    title: string;
    subject: string;
    instructor?: string; // Optional in DB?
    duration?: string;
    thumbnail?: string; // YouTube thumbnail usually derived from ID, but maybe stored
    videoUrl: string; // YouTube ID
    createdAt: Timestamp;
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [activeCategory, setActiveCategory] = useState("الكل");
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLessons() {
            try {
                // Fetch latest lessons
                const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"), limit(10));
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
    }, [user]);

    if (authLoading || loading) return <div className="p-8"><LessonSkeleton /></div>;

    const filteredVideos = activeCategory === "الكل"
        ? lessons
        : lessons.filter(v => v.subject === activeCategory);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        صباح الخير، {user?.displayName?.split(' ')[0] || "يا بطل"} 👋
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        جاهز لمواصلة التحضير للبكالوريا؟
                    </p>
                </div>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                            activeCategory === cat
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "bg-card border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            <div>
                {filteredVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredVideos.map((video) => (
                            <VideoCard
                                key={video.id}
                                title={video.title}
                                subject={video.subject}
                                instructor={video.instructor || "BacX Instructor"}
                                duration={video.duration || "20:00"}
                                // Generate YouTube thumbnail if not provided
                                thumbnail={video.thumbnail || `https://img.youtube.com/vi/${video.videoUrl}/hqdefault.jpg`}
                                href={`/lessons/${video.id}`} // Correct Routing Logic
                                progress={0} // Future: fetch user progress
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        لا توجد دروس متاحة في هذا القسم حالياً.
                    </div>
                )}
            </div>
        </div>
    );
}
