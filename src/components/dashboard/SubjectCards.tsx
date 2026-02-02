"use client";

import { SubjectDTO } from "@/types/subject";
import { SubjectCard } from "./SubjectCard";
import { Clock } from "lucide-react";

interface SubjectCardsProps {
    query?: string;
    initialSubjects?: SubjectDTO[];
}

export function SubjectCards({ query, initialSubjects = [] }: SubjectCardsProps) {
    // Filter Logic (Client Side) based on props
    const filteredSubjects = initialSubjects.filter((s) => {
        if (!query) return true;
        const q = query.toLowerCase();
        const matchesSubject = s.name.toLowerCase().includes(q);
        const matchesLesson = s.lessons?.some((l) => l.title.toLowerCase().includes(q));
        return matchesSubject || matchesLesson;
    });

    if (filteredSubjects.length === 0) {
        return (
            <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-center opacity-50 space-y-4 rounded-2xl border border-white/5 bg-white/5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-bold text-white">
                    {query ? "لا توجد نتائج" : "ابدأ رحلتك التعليمية"}
                </h3>
                <p className="text-sm text-white/40 max-w-md">
                    {query
                        ? `لم يتم العثور على مواد تطابق "${query}"`
                        : "لا توجد مواد متاحة حالياً. يرجى تصفح المسارات أو التواصل مع الإدارة."}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
            ))}
        </div>
    );
}

