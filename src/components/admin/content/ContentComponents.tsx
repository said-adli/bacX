'use client';

import { Subject, Unit, Lesson, deleteSubject, deleteUnit, deleteLesson } from "@/actions/admin-content-actions";
import { AdminGlassCard } from "../ui/AdminGlassCard";
import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, PlayCircle, Lock, Unlock, GripVertical, Video, FileText } from "lucide-react";
import { toast } from "sonner";

// --- LESSON ITEM ---
function LessonItem({ lesson }: { lesson: Lesson }) {
    const handleDelete = async () => {
        if (!confirm("Delete this lesson?")) return;
        const res = await deleteLesson(lesson.id);
        if (res.success) toast.success("Lesson deleted");
        else toast.error("Failed to delete lesson");
    };

    return (
        <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/10 ml-6">
            <GripVertical className="h-4 w-4 text-gray-600 cursor-move" />
            <div className={`p-2 rounded-full ${lesson.is_free ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {lesson.is_free ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">{lesson.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Video className="h-3 w-3" /> {lesson.duration}
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleDelete} className="p-1 hover:text-red-400 text-gray-500"><Trash2 className="h-3 w-3" /></button>
            </div>
        </div>
    );
}

// --- UNIT ITEM ---
function UnitItem({ unit }: { unit: Unit }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Delete this unit and ALL its lessons?")) return;
        const res = await deleteUnit(unit.id);
        if (res.success) toast.success("Unit deleted");
        else toast.error("Failed to delete unit");
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <FileText className="h-4 w-4 text-purple-400" />
                <span className="flex-1 text-sm font-bold text-gray-200">{unit.name}</span>

                <div className="flex gap-2">
                    <button title="Add Lesson" className="rounded-full p-1 hover:bg-white/10 hover:text-green-400 text-gray-500">
                        <Plus className="h-4 w-4" />
                    </button>
                    <button onClick={handleDelete} title="Delete Unit" className="rounded-full p-1 hover:bg-white/10 hover:text-red-400 text-gray-500">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="space-y-2 pl-4 border-l border-white/10 ml-4">
                    {unit.lessons?.length === 0 && <p className="text-xs text-gray-600 py-2">No lessons yet.</p>}
                    {unit.lessons?.map(lesson => (
                        <LessonItem key={lesson.id} lesson={lesson} />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- SUBJECT CARD ---
export function SubjectCard({ subject }: { subject: Subject }) {
    const handleDelete = async () => {
        if (!confirm("Delete subject? This action is irreversible.")) return;
        const res = await deleteSubject(subject.id);
        if (res.success) toast.success("Subject deleted");
        else toast.error("Failed to delete subject");
    };

    return (
        <AdminGlassCard className="p-4" gradient>
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                        {/* Placeholder for Icon (can use Lucide dynamic later) */}
                        <span className="text-lg font-bold">{subject.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{subject.name}</h3>
                        <p className="text-xs text-gray-400">{subject.units?.length} Units</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="rounded-lg bg-white/5 p-2 text-sm font-medium text-white hover:bg-white/10">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={handleDelete} className="rounded-lg bg-red-500/10 p-2 text-sm font-medium text-red-400 hover:bg-red-500/20">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {subject.units?.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No Content Yet</div>}
                {subject.units?.map(unit => (
                    <UnitItem key={unit.id} unit={unit} />
                ))}
            </div>

            <button className="mt-4 w-full rounded-xl border border-dashed border-white/20 py-3 text-sm font-medium text-gray-400 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-400 transition-all">
                + Add New Unit
            </button>
        </AdminGlassCard>
    );
}
