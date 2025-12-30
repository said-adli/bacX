"use client";

import { Suspense } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { BacCountdown, ProgressWidget, AnnouncementsFeed, UpcomingLives } from "@/components/dashboard/Widgets";
import { Atom, Divide, Globe, Calculator, BookOpen, ChevronRight } from "lucide-react"; // Updated Icons
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Subjects Data (Replaced Emojis with Lucide Icons)
const subjects = [
    { id: "math", name: "الرياضيات", icon: <Calculator className="w-8 h-8 text-blue-600" />, color: "border-blue-100" },
    { id: "physics", name: "الفيزياء", icon: <Atom className="w-8 h-8 text-blue-600" />, color: "border-blue-100" },
    { id: "science", name: "العلوم", icon: <Divide className="w-8 h-8 text-blue-600" />, color: "border-blue-100" }, // Using Divide as generic science/bio placeholder or DNA if available
    { id: "philosophy", name: "الفلسفة", icon: <BookOpen className="w-8 h-8 text-blue-600" />, color: "border-blue-100" },
    { id: "english", name: "الإنجليزية", icon: <Globe className="w-8 h-8 text-blue-600" />, color: "border-blue-100" },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
            <div className="flex flex-col h-full">
                {/* Header Section */}
                <header className="px-6 py-6 pb-2">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                صباح الخير، <span className="text-blue-600">سعيد</span> 👋
                            </h1>
                            <p className="text-slate-500 text-lg">جاهز لتحقيق أهدافك اليوم؟</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-6 py-6 space-y-8 max-w-7xl mx-auto w-full">

                    {/* TOP ROW: Urgent Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Countdown */}
                        <div className="md:col-span-1 h-44">
                            <BacCountdown />
                        </div>
                        {/* Progress */}
                        <div className="md:col-span-1 h-44">
                            <ProgressWidget />
                        </div>
                        {/* Quick Stats or Quote (Placeholder for visual balance) */}
                        <div className="md:col-span-1 h-44 bg-white/70 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl p-6 flex items-center justify-center text-center">
                            <p className="text-slate-600 font-medium italic">"النجاح هو مجموع مجهودات صغيرة تتكرر يوماً بعد يوم."</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* MAIN COLUMN: Feeds */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Announcements */}
                            <section className="h-80">
                                <AnnouncementsFeed />
                            </section>

                            {/* Live Sessions */}
                            <section className="h-64">
                                <UpcomingLives />
                            </section>
                        </div>

                        {/* SIDE COLUMN: Subjects Grid (Now Vertical-ish for sidebar feel or kept as grid) */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-xl text-slate-800">مواد تخصصك</h3>
                                <Link href="/subjects" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                    عرض الكل <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {subjects.map((subject) => (
                                    <Link
                                        key={subject.id}
                                        href={`/subject/${subject.id}`}
                                        className={`group relative bg-white/60 hover:bg-white/90 backdrop-blur-md border border-blue-100/50 hover:border-blue-400/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-200/50 flex flex-col items-center gap-3 text-center`}
                                    >
                                        <div className="p-3 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                                            {subject.icon}
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-sm">
                                            {subject.name}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
