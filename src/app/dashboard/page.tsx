"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { BacCountdown, ProgressWidget, AnnouncementsFeed, UpcomingLives } from "@/components/dashboard/Widgets";
import { BookOpen, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { LessonSkeleton } from "@/components/skeletons/LessonSkeleton";

const subjects = [
    { id: "الرياضيات", name: "الرياضيات", icon: "📐", color: "from-blue-500/20 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40" },
    { id: "الفيزياء", name: "الفيزياء", icon: "⚡", color: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40" },
    { id: "العلوم", name: "العلوم", icon: "🧬", color: "from-green-500/20 to-green-600/5 border-green-500/20 hover:border-green-500/40" },
    { id: "اللغات", name: "اللغات", icon: "🌍", color: "from-purple-500/20 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40" },
    { id: "الفلسفة", name: "الفلسفة", icon: "🤔", color: "from-rose-500/20 to-rose-600/5 border-rose-500/20 hover:border-rose-500/40" },
];

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (loading || !mounted) return <div className="p-8"><LessonSkeleton /></div>;

    const firstName = user?.displayName?.split(' ')[0] || "يا بطل";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-6 md:p-8 max-w-7xl mx-auto">

            {/* 1. Header & Greeting */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        صباح الخير، <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-purple-500">{firstName}</span> 👋
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        لديك <span className="text-white font-bold">3 مهام</span> اليوم، واصل التركيز!
                    </p>
                </div>
                {/* Could add a specific CTA here later */}
            </div>

            {/* 2. Top Widgets (Countdown & Progress) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BacCountdown />
                <ProgressWidget progress={35} /> {/* Mock progress for now */}
            </div>

            {/* 3. Middle Section (Feeds) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-80">
                <div className="lg:col-span-1 h-full">
                    <AnnouncementsFeed />
                </div>
                <div className="lg:col-span-2 h-full">
                    <UpcomingLives />
                </div>
            </div>

            {/* 4. Subjects Refined Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        مساحة العمل
                    </h2>
                    <span className="text-xs text-zinc-500 bg-zinc-900 border border-white/10 px-3 py-1 rounded-full">
                        اختر المادة للمتابعة
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {subjects.map((subject) => (
                        <Link
                            key={subject.id}
                            href={`/subject/${subject.id}`}
                            className={`group relative overflow-hidden bg-gradient-to-br ${subject.color} border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                        >
                            <div className="flex flex-col items-center text-center gap-3 relative z-10">
                                <div className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                    {subject.icon}
                                </div>
                                <h3 className="font-bold text-white text-sm md:text-base group-hover:text-white/90 transition-colors">
                                    {subject.name}
                                </h3>
                            </div>

                            {/* Hover Arrow */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <ChevronRight className="w-4 h-4 text-white/50" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

