"use client";

import { useAuth } from "@/context/AuthContext";
import { VideoCard } from "@/components/dashboard/VideoCard";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LessonSkeleton } from "@/components/skeletons/LessonSkeleton";
import Link from "next/link";
import { PlayCircle, BookOpen, ChevronRight } from "lucide-react";

const subjects = [
    { id: "الرياضيات", name: "الرياضيات", icon: "📐", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { id: "الفيزياء", name: "الفيزياء", icon: "⚡", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    { id: "العلوم", name: "العلوم", icon: "🧬", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    { id: "اللغات", name: "اللغات", icon: "🌍", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { id: "الفلسفة", name: "الفلسفة", icon: "🤔", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
];

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

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [continueWatching, setContinueWatching] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLastWatched() {
            try {
                // Ideally fetch from user profile 'lastWatched'
                // For now, just fetch the most recent lesson as a suggestion
                const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"), limit(1));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setContinueWatching({ id: doc.id, ...doc.data() } as Lesson);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchLastWatched();
        }
    }, [user]);

    if (authLoading || loading) return <div className="p-8"><LessonSkeleton /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    صباح الخير، {user?.displayName?.split(' ')[0] || "يا بطل"} 👋
                </h1>
                <p className="text-muted-foreground mt-2">
                    جاهز لمواصلة التحضير للبكالوريا؟
                </p>
            </div>

            {/* Continue Watching Section */}
            {continueWatching && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-primary" />
                            متابعة المشاهدة
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <VideoCard
                            key={continueWatching.id}
                            title={continueWatching.title}
                            subject={continueWatching.subject}
                            instructor={continueWatching.instructor || "BacX Instructor"}
                            duration={continueWatching.duration || "20:00"}
                            thumbnail={continueWatching.thumbnail || `https://img.youtube.com/vi/${continueWatching.videoUrl}/hqdefault.jpg`}
                            href={`/video/${continueWatching.id}`} // Correct Routing to /video
                            progress={45} // Mock progress
                        />
                    </div>
                </div>
            )}

            {/* My Subjects Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        موادي
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {subjects.map((subject) => (
                        <Link
                            key={subject.id}
                            href={`/subject/${subject.id}`}
                            className="group relative overflow-hidden bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 block"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${subject.color}`}>
                                {subject.icon}
                            </div>
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{subject.name}</h3>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-[-4px] group-hover:text-primary transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
