"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Layers } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

// Stream Data
const STREAMS = [
    { id: "all", label: "الكل" },
    { id: "science", label: "علوم تجريبية" },
    { id: "math", label: "رياضيات" },
    { id: "tech-math", label: "تقني رياضي" },
    { id: "management", label: "تسيير واقتصاد" },
    { id: "literature", label: "آداب وفلسفة" },
    { id: "languages", label: "لغات أجنبية" },
];

interface Subject {
    id: string;
    title: string;
    instructor: string;
    streamTags: string[]; // e.g., ['science', 'math']
}

// Mock Data (Empty for now as requested)
const SUBJECTS: Subject[] = [];

export default function TracksPage() {
    const [selectedStream, setSelectedStream] = useState("all");

    // Filter Logic
    const filteredSubjects = selectedStream === "all"
        ? SUBJECTS
        : SUBJECTS.filter(sub => sub.streamTags.includes(selectedStream));

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-tajawal pt-28 pb-20 relative overflow-hidden" dir="rtl">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* 1. Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white/50">
                        مسارات البكالوريا
                    </h1>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto">
                        اختر شعبتك لتكتشف المواد الدراسية، الدروس، والتمارين المتاحة لك خصيصاً.
                    </p>
                </div>

                {/* 2. Stream Filters (Chips) */}
                <div className="mb-12 flex justify-center">
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 px-4 max-w-full no-scrollbar mask-gradient-x">
                        {STREAMS.map((stream) => (
                            <button
                                key={stream.id}
                                onClick={() => setSelectedStream(stream.id)}
                                className={cn(
                                    "relative px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border",
                                    selectedStream === stream.id
                                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105"
                                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {stream.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Content Area */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {filteredSubjects.length > 0 ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {/* Access Card Component here if data existed */}
                                {filteredSubjects.map(sub => (
                                    <div key={sub.id}>{sub.title}</div>
                                ))}
                            </motion.div>
                        ) : (
                            /* 4. ONE PREMIUM EMPTY STATE */
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center justify-center text-center py-20"
                            >
                                <GlassCard className="p-12 max-w-2xl border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">

                                    {/* Decoration */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform duration-500">
                                            <Layers className="w-10 h-10 text-white/40 group-hover:text-blue-400 transition-colors" />
                                        </div>

                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            لم يتم إضافة مواد لهذه الشعبة بعد
                                        </h2>

                                        <p className="text-white/50 max-w-md mx-auto mb-8 leading-relaxed">
                                            نعمل حالياً على إعداد محتوى تعليمي عالي الجودة ومكثف لطلاب
                                            <span className="text-blue-400 font-bold mx-1">
                                                {STREAMS.find(s => s.id === selectedStream)?.label}
                                            </span>
                                            لامتياز البكالوريا.
                                        </p>

                                        <div className="px-5 py-2 rounded-full bg-white/20 border border-white/20 text-xs font-mono text-white/70">
                                            STAY TUNED • Coming Soon
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
