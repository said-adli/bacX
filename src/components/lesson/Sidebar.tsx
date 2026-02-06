"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lock, MessageSquare, BookOpen, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Lesson {
    id: string;
    title: string;
    duration: string | null;
    is_free: boolean;
    unit_id: string;
    isOwned?: boolean;
}

interface Unit {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface SidebarProps {
    units?: Unit[];
    activeLessonId?: string;
    subjectId?: string;
}

export function Sidebar({ units = [], activeLessonId, subjectId = "" }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'syllabus' | 'chat'>('syllabus');

    // Auto-expand the unit containing the active lesson
    const getInitialExpandedUnits = () => {
        if (!activeLessonId && units.length > 0) return new Set([units[0].id]);
        const activeUnit = units.find(u => u.lessons.some(l => l.id === activeLessonId));
        if (activeUnit) return new Set([activeUnit.id]);
        return new Set(units.length > 0 ? [units[0].id] : []);
    };

    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(getInitialExpandedUnits);
    const { user, role } = useAuth();
    const router = useRouter();

    const hasAccess = role === 'admin' || (user as { isSubscribed?: boolean } | null)?.isSubscribed;

    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => {
            const next = new Set(prev);
            if (next.has(unitId)) next.delete(unitId);
            else next.add(unitId);
            return next;
        });
    };

    const handleLessonLock = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.error("هذا الدرس متاح للمشتركين فقط", {
            icon: <Lock className="w-4 h-4" />,
            action: {
                label: "اشتراك",
                onClick: () => router.push('/subscription')
            }
        });
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col overflow-hidden bg-white/[0.02] border border-white/5 rounded-2xl shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-black/20 shrink-0">
                <button
                    onClick={() => setActiveTab('syllabus')}
                    className={cn(
                        "flex-1 py-4 text-sm font-bold transition-all relative outline-none",
                        activeTab === 'syllabus' ? "text-blue-400 bg-white/5 shadow-sm" : "text-white/40 hover:bg-white/5"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>محتوى المادة</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={cn(
                        "flex-1 py-4 text-sm font-bold transition-all relative outline-none",
                        activeTab === 'chat' ? "text-blue-400 bg-white/5 shadow-sm" : "text-white/40 hover:bg-white/5"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>المناقشة</span>
                    </div>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-black/10">
                <AnimatePresence mode="wait">
                    {activeTab === 'chat' ? (
                        <motion.div
                            key="chat-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col p-4"
                        >
                            <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4">
                                <MessageSquare className="w-12 h-12 opacity-50" />
                                <p>المناقشات ستتاح قريباً</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="syllabus-tab"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-2 p-2"
                        >
                            {units.length > 0 ? units.map((unit) => (
                                <div key={unit.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/5">
                                    <button
                                        onClick={() => toggleUnit(unit.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-right sticky top-0 bg-white/5 backdrop-blur-sm z-10"
                                    >
                                        <span className="font-bold text-white/90 text-sm">{unit.title}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] px-2 py-0.5 bg-black/40 rounded-md text-white/50">
                                                {unit.lessons?.length || 0}
                                            </span>
                                            {expandedUnits.has(unit.id) ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                                        </div>
                                    </button>

                                    {/* Lessons List */}
                                    <AnimatePresence initial={false}>
                                        {expandedUnits.has(unit.id) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="bg-black/20 border-t border-white/5 overflow-hidden"
                                                style={{ willChange: "height" }} // GPU Hint Phase 3
                                            >
                                                <div className="p-2 space-y-1">
                                                    {(unit.lessons || []).map((lesson) => {
                                                        // CHECK: Admin OR Subscribed OR Free OR Owned
                                                        const isLocked = !hasAccess && !lesson.is_free && !lesson.isOwned;
                                                        const isActive = activeLessonId === lesson.id;
                                                        const LinkComponent = isLocked ? 'div' : Link;

                                                        return (
                                                            <LinkComponent
                                                                href={isLocked ? '#' : `/materials/${subjectId}?lessonId=${lesson.id}`}
                                                                key={lesson.id}
                                                                onClick={isLocked ? handleLessonLock : undefined}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 p-3 rounded-lg text-right transition-all group relative overflow-hidden",
                                                                    isActive
                                                                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[inset_0_0_10px_rgba(37,99,235,0.1)]"
                                                                        : "hover:bg-white/5 text-white/70 border border-transparent",
                                                                    isLocked && "opacity-60 cursor-not-allowed grayscale"
                                                                )}
                                                            >
                                                                {/* Active Indicator Line */}
                                                                {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500" />}

                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors text-xs font-bold",
                                                                    isActive ? "bg-blue-600/20 text-blue-400" : "bg-white/5 group-hover:bg-white/10 text-white/40",
                                                                    isLocked && "bg-red-500/10 text-red-500"
                                                                )}>
                                                                    {isLocked ? <Lock size={12} /> : (isActive ? <PlayCircle size={14} /> : (lesson.duration ? <span className="text-[10px]">Play</span> : <BookOpen size={12} />))}
                                                                </div>

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-xs font-medium truncate">{lesson.title}</p>
                                                                        {lesson.isOwned && (
                                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                                                                                مملوكة
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[10px] text-white/30 truncate mt-0.5">{lesson.duration || "PDF / نص"}</p>
                                                                </div>
                                                            </LinkComponent>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-white/30">
                                    لا توجد وحدات
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
