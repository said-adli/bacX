"use client";

import Link from "next/link";
import { Calculator, Zap, Microscope, BookOpen, Feather, Globe, LayoutGrid, ArrowLeft } from "lucide-react";

interface Subject {
    id: string; // Must be UUID
    name: string;
    description?: string;
    color?: string;
    unitCount?: number;
    lessonCount?: number;
    progress?: number; // NEW: 0-100 percentage
    [key: string]: any;
}

const getSubjectConfig = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes('رياضيات') || normalized.includes('math')) {
        return { icon: Calculator, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'group-hover:border-blue-500/30', barColor: 'bg-blue-500' };
    }
    if (normalized.includes('فيزياء') || normalized.includes('physics')) {
        return { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'group-hover:border-yellow-500/30', barColor: 'bg-yellow-500' };
    }
    if (normalized.includes('علوم') || normalized.includes('science')) {
        return { icon: Microscope, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'group-hover:border-emerald-500/30', barColor: 'bg-emerald-500' };
    }
    if (normalized.includes('أدب') || normalized.includes('literature') || normalized.includes('عربية')) {
        return { icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'group-hover:border-purple-500/30', barColor: 'bg-purple-500' };
    }
    if (normalized.includes('فلسفة') || normalized.includes('philosophy')) {
        return { icon: Feather, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'group-hover:border-pink-500/30', barColor: 'bg-pink-500' };
    }
    if (normalized.includes('انجليزية') || normalized.includes('english')) {
        return { icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'group-hover:border-indigo-500/30', barColor: 'bg-indigo-500' };
    }
    return { icon: LayoutGrid, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'group-hover:border-slate-500/30', barColor: 'bg-slate-500' };
};

export const SubjectCard = ({ subject }: { subject: Subject }) => {
    const config = getSubjectConfig(subject.name);
    const Icon = config.icon;
    const progressValue = subject.progress ?? 0;

    return (
        <Link
            href={`/materials/${subject.id}`}
            onClick={() => console.log('Navigating to subject ID:', subject.id)}
        >
            <div className={`glass-card relative h-52 overflow-hidden group hover:scale-[1.02] cursor-pointer transition-all duration-300 border border-white/5 ${config.border}`}>

                {/* Content Container */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                            <Icon size={28} strokeWidth={1.5} />
                        </div>

                        {/* Arrow */}
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-white/10 group-hover:text-white transition-colors">
                            <ArrowLeft size={16} strokeWidth={1.5} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                            {subject.name}
                        </h3>
                        {subject.description && (
                            <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                                {subject.description}
                            </p>
                        )}

                        {/* Stats Row */}
                        {(subject.unitCount !== undefined || subject.lessonCount !== undefined) && (
                            <div className="flex items-center gap-4 text-xs font-medium text-white/40 pt-3 border-t border-white/5 group-hover:border-white/10 transition-colors mt-2">
                                {subject.unitCount !== undefined && (
                                    <span className="flex items-center gap-1.5">
                                        <div className={`w-1 h-1 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                                        {subject.unitCount} وحدات
                                    </span>
                                )}
                                {subject.lessonCount !== undefined && (
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-white/20" />
                                        {subject.lessonCount} درس
                                    </span>
                                )}
                                {/* Progress Percentage */}
                                {progressValue > 0 && (
                                    <span className={`mr-auto font-bold ${config.color}`}>
                                        {progressValue}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                    <div
                        className={`h-full ${config.barColor} transition-all duration-700 ease-out`}
                        style={{ width: `${progressValue}%` }}
                    />
                </div>
            </div>
        </Link>
    );
};

