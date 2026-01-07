"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
// import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
// import { db } from "@/lib/firebase";
import { GlassCard } from "@/components/ui/GlassCard";
import { FileQuestion, Download, Search } from "lucide-react";
import { LessonSkeleton } from "@/components/skeletons/LessonSkeleton";

interface Exercise {
    id: string;
    title: string;
    subject: string;
    pdfUrl: string;
    year?: string;
    difficulty?: string;
}

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchExercises() {
            try {
                // Supabase Fetch
                const { data, error } = await supabase
                    .from("exercises")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(20);

                if (error) throw error;

                if (data) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setExercises(data.map((doc: any) => ({
                        id: doc.id,
                        title: doc.title,
                        subject: doc.subject,
                        pdfUrl: doc.pdf_url || doc.pdfUrl, // Handle snake_case or legacy match
                        year: doc.year,
                        difficulty: doc.difficulty
                    })));
                }
            } catch (error) {
                console.error("Error fetching exercises:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchExercises();
    }, [supabase]);

    // Render skeleton inline instead of blocking
    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] p-6 pb-24 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-2" />
                        <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[4/3] bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-6 pb-24 text-white font-tajawal">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">بنك التمارين</h1>
                    <p className="text-zinc-400">تدرب على تمارين سابقة ومقترحة للبكالوريا</p>
                </div>

                {exercises.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exercises.map((exercise) => (
                            <GlassCard key={exercise.id} className="p-6 hover:border-primary/30 transition-colors group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-white/5 text-zinc-400 border border-white/5">
                                                {exercise.subject}
                                            </span>
                                            {exercise.year && (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/10">
                                                    {exercise.year}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {exercise.title}
                                        </h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <FileQuestion className="w-5 h-5 text-zinc-400" />
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">{exercise.difficulty || "متوسط"}</span>
                                    <a
                                        href={exercise.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        تحميل PDF
                                    </a>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-zinc-400 font-bold mb-2">لا توجد تمارين حالياً</h3>
                        <p className="text-sm text-zinc-600">سيتم إضافة تمارين جديدة قريباً</p>
                    </div>
                )}
            </div>
        </div>
    );
}
