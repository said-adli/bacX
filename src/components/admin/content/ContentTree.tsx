"use client";

import { useState } from "react";
import { Folder, FileVideo, Plus, Trash2, Edit, ChevronRight, ChevronDown, Lock as LockIcon } from "lucide-react";
import {
    Subject,
    Unit,
    Lesson,
    createUnit,
    deleteUnit,
    deleteLesson
} from "@/actions/admin-content";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ContentEditor from "@/components/admin/content/ContentEditor";
import { SubscriptionPlan } from "@/actions/admin-plans";

interface ContentTreeProps {
    subjects: Subject[];
    activePlans: SubscriptionPlan[];
}

export default function ContentTree({ subjects, activePlans }: ContentTreeProps) {
    const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [isCreatingLesson, setIsCreatingLesson] = useState<{ unitId: string } | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null); // For editor

    // Toggle Unit Expansion
    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
    };

    // Unit Actions
    const handleAddUnit = async (subjectId: string) => {
        const title = prompt("Enter Unit Title:");
        if (!title) return;
        try {
            await createUnit(subjectId, title);
            toast.success("Unit Added");
        } catch (e) {
            toast.error("Failed to add unit");
        }
    };

    const handleDeleteUnit = async (id: string) => {
        if (!confirm("Delete this unit and all its content?")) return;
        try {
            await deleteUnit(id);
            toast.success("Unit Deleted");
        } catch (e) {
            toast.error("Failed");
        }
    };

    // Lesson Actions
    const handleDeleteLesson = async (id: string) => {
        if (!confirm("Delete this lesson?")) return;
        try {
            await deleteLesson(id);
            toast.success("Lesson Deleted");
        } catch (e) {
            toast.error("Failed");
        }
    };

    const openEditor = (unitId: string, lesson?: Lesson) => {
        setIsCreatingLesson({ unitId });
        setSelectedLesson(lesson || null);
    };

    const closeEditor = () => {
        setIsCreatingLesson(null);
        setSelectedLesson(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">

            {/* The Tree (Column 1) */}
            <div className="lg:col-span-1 bg-black/20 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-400 uppercase text-xs tracking-wider">Course Structure</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {subjects.map(subject => (
                        <div key={subject.id} className="space-y-2">
                            <div className="flex items-center gap-2 text-white font-bold text-lg p-2 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                                <Folder className="text-blue-500" size={20} />
                                {subject.name}
                                <button
                                    onClick={() => handleAddUnit(subject.id)}
                                    className="ml-auto p-1.5 hover:bg-blue-500 hover:text-white rounded-lg text-blue-500 transition-colors"
                                    title="Add Unit"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="pl-4 space-y-2 border-l-2 border-white/5 ml-4">
                                {subject.units?.map(unit => (
                                    <div key={unit.id} className="space-y-1">
                                        <div
                                            className="flex items-center gap-2 text-zinc-300 hover:text-white p-2 rounded-lg hover:bg-white/5 cursor-pointer group"
                                            onClick={() => toggleUnit(unit.id)}
                                        >
                                            <span className="text-zinc-500">
                                                {expandedUnits[unit.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </span>
                                            <span className="flex-1 text-sm font-medium">{unit.title}</span>

                                            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditor(unit.id); }}
                                                    className="p-1 hover:bg-emerald-500/20 text-emerald-500 rounded"
                                                    title="Add Lesson"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); }}
                                                    className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                                                    title="Delete Unit"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {expandedUnits[unit.id] && (
                                            <div className="pl-6 space-y-1">
                                                {unit.lessons?.map(lesson => (
                                                    <div
                                                        key={lesson.id}
                                                        onClick={() => openEditor(unit.id, lesson)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer text-sm transition-colors border border-transparent",
                                                            selectedLesson?.id === lesson.id
                                                                ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                                                                : "hover:bg-white/5 text-zinc-400"
                                                        )}
                                                    >
                                                        <FileVideo size={14} className={lesson.type === 'live_stream' ? 'text-red-500' : 'text-blue-400'} />
                                                        <span className="flex-1 truncate">{lesson.title}</span>
                                                        {lesson.required_plan_id && (
                                                            <div title="Restricted Access">
                                                                <LockIcon size={12} className="text-amber-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {(!unit.lessons || unit.lessons.length === 0) && (
                                                    <div className="text-xs text-zinc-600 italic pl-2 py-1">No content yet</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* The Editor (Columns 2 & 3) */}
            <div className="lg:col-span-2">
                {isCreatingLesson ? (
                    <ContentEditor
                        unitId={isCreatingLesson.unitId}
                        initialData={selectedLesson || undefined}
                        activePlans={activePlans} // Dynamic Logic: Granular Access
                        onClose={closeEditor}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 border border-white/5 rounded-3xl bg-black/20 border-dashed text-zinc-600">
                        <Folder size={64} className="mb-4 opacity-20" />
                        <p className="text-lg">Select a unit or lesson to edit content</p>
                    </div>
                )}
            </div>
        </div>
    );
}
