"use client";

import { useState, useEffect } from "react";
import { Folder, FileVideo, Plus, Trash2, ChevronRight, ChevronDown, Lock as LockIcon, GripVertical } from "lucide-react";
import {
    createUnit,
    deleteUnit,
    deleteLesson,
    createSubject
} from "@/actions/admin-content";
import { SubjectWithUnitsDTO, UnitDTO, LessonDTO } from "@/types/curriculum";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ContentEditor from "@/components/admin/content/ContentEditor";
import { SubscriptionPlan } from "@/actions/admin-plans";
import { SortableList } from "@/components/ui/SortableList";
import { SortableItem, DragHandle } from "@/components/ui/SortableItem";
import { reorderItems } from "@/actions/reorder";
import { StatusToggle } from "@/components/admin/shared/StatusToggle";
import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogPortal } from "@/components/ui/Dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/AlertDialog";

interface ContentTreeProps {
    subjects: SubjectWithUnitsDTO[];
    activePlans: SubscriptionPlan[];
}

export default function ContentTree({ subjects: initialSubjects, activePlans }: ContentTreeProps) {
    const [subjects, setSubjects] = useState<SubjectWithUnitsDTO[]>(initialSubjects);
    const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

    const [isCreatingLesson, setIsCreatingLesson] = useState<{ subjectId: string, unitId: string } | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<LessonDTO | null>(null);
    const [isCreatingSubject, setIsCreatingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState("");

    // Modal States for Units
    const [unitToCreateInSubject, setUnitToCreateInSubject] = useState<string | null>(null);
    const [newUnitTitle, setNewUnitTitle] = useState("");

    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

    // Sync props to state (for initial load and checks, though mostly local mutation matters for drag)
    useEffect(() => {
        setSubjects(initialSubjects);
    }, [initialSubjects]);

    // Reorder Handlers
    const handleReorderSubjects = async (newSubjects: SubjectWithUnitsDTO[]) => {
        setSubjects(newSubjects); // Optimistic
        try {
            await reorderItems("subjects", newSubjects.map(s => s.id));
        } catch {
            toast.error("Failed to reorder subjects");
            setSubjects(subjects); // Revert
        }
    };

    const handleReorderLessons = async (subjectId: string, unitId: string, newLessons: LessonDTO[]) => {
        const newSubjects = subjects.map(sub => {
            if (sub.id !== subjectId) return sub;
            return {
                ...sub,
                units: sub.units?.map((unit: UnitDTO) => {
                    if (unit.id !== unitId) return unit;
                    return { ...unit, lessons: newLessons };
                })
            };
        });

        setSubjects(newSubjects); // Optimistic

        try {
            await reorderItems("lessons", newLessons.map(l => l.id));
        } catch {
            toast.error("Failed to reorder lessons");
            setSubjects(subjects); // Revert
        }
    };


    // Toggle Unit Expansion
    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
    };

    // Unit Actions
    const handleCreateUnitConfirm = async () => {
        if (!newUnitTitle.trim() || !unitToCreateInSubject) return;
        try {
            await createUnit(unitToCreateInSubject, newUnitTitle);
            toast.success("Unit Added");
            setUnitToCreateInSubject(null);
            setNewUnitTitle("");
        } catch {
            toast.error("Failed to add unit");
        }
    };

    const handleDeleteUnitConfirm = async () => {
        if (!unitToDelete) return;
        try {
            await deleteUnit(unitToDelete);
            toast.success("Unit Deleted");
            setUnitToDelete(null);
        } catch (e) {
            toast.error("Failed");
        }
    };

    // Lesson Actions

    const openEditor = (subjectId: string, unitId: string, lesson?: LessonDTO) => {
        setIsCreatingLesson({ subjectId, unitId });
        setSelectedLesson(lesson || null);
    };

    const closeEditor = () => {
        setIsCreatingLesson(null);
        setSelectedLesson(null);
    };

    // Subject Creation Handler
    const handleCreateSubject = async () => {
        if (!newSubjectName.trim()) return;
        try {
            await createSubject(newSubjectName, 'Folder', subjects.length); // Default icon and append order
            toast.success("Subject Created");
            setIsCreatingSubject(false);
            setNewSubjectName("");
        } catch (e) {
            console.error(e);
            toast.error("Failed to create subject");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">

            {/* The Tree (Column 1) */}
            <div className="lg:col-span-1 bg-black/20 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-400 uppercase text-xs tracking-wider">Course Structure</h3>
                    <button
                        onClick={() => setIsCreatingSubject(true)}
                        className="p-1.5 hover:bg-blue-500 hover:text-white rounded-lg text-blue-500 transition-colors flex items-center gap-1 text-xs font-bold px-2"
                    >
                        <Plus size={14} /> NEW SUBJECT
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <SortableList
                        items={subjects}
                        onReorder={handleReorderSubjects}
                        className="space-y-6"
                        renderItem={(subject) => (
                            <SortableItem key={subject.id} id={subject.id}>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-white font-bold text-lg p-2 bg-blue-900/10 border border-blue-500/20 rounded-xl group relative">
                                        <DragHandle className="p-1 text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing">
                                            <GripVertical size={16} />
                                        </DragHandle>
                                        <Folder className="text-blue-500" size={20} />
                                        {subject.name}
                                        <div className="ml-auto flex items-center gap-2">
                                            <StatusToggle
                                                table="subjects"
                                                id={subject.id}
                                                field="is_active"
                                                initialValue={subject.is_active ?? false}
                                                labelActive="PUB"
                                                labelInactive="DRAFT"
                                            />
                                            <button
                                                onClick={() => setUnitToCreateInSubject(subject.id)}
                                                className="p-1.5 hover:bg-blue-500 hover:text-white rounded-lg text-blue-500 transition-colors"
                                                title="Add Unit"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pl-4 space-y-2 border-l-2 border-white/5 ml-4">
                                        {subject.units?.map((unit: UnitDTO) => (
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
                                                            onClick={(e) => { e.stopPropagation(); openEditor(subject.id, unit.id); }}
                                                            className="p-1 hover:bg-emerald-500/20 text-emerald-500 rounded"
                                                            title="Add Lesson"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setUnitToDelete(unit.id); }}
                                                            className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                                                            title="Delete Unit"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {expandedUnits[unit.id] && (
                                                    <div className="pl-6 space-y-1">
                                                        <SortableList
                                                            items={unit.lessons || []}
                                                            onReorder={(newLessons) => handleReorderLessons(subject.id, unit.id, newLessons)}
                                                            className="space-y-1"
                                                            renderItem={(lesson) => (
                                                                <SortableItem key={lesson.id} id={lesson.id}>
                                                                    <div
                                                                        onClick={() => openEditor(subject.id, unit.id, lesson)}
                                                                        className={cn(
                                                                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer text-sm transition-colors border border-transparent group",
                                                                            selectedLesson?.id === lesson.id
                                                                                ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                                                                                : "hover:bg-white/5 text-zinc-400"
                                                                        )}
                                                                    >
                                                                        <DragHandle className="opacity-0 group-hover:opacity-100 -ml-2 p-1 text-zinc-600 hover:text-zinc-400">
                                                                            <GripVertical size={14} />
                                                                        </DragHandle>
                                                                        <FileVideo size={14} className={lesson.type === 'live_stream' ? 'text-red-500' : 'text-blue-400'} />
                                                                        <span className="flex-1 truncate">{lesson.title}</span>
                                                                        {lesson.required_plan_id && (
                                                                            <div title="Restricted Access">
                                                                                <LockIcon size={12} className="text-amber-500" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </SortableItem>
                                                            )}
                                                        />
                                                        {(!unit.lessons || unit.lessons.length === 0) && (
                                                            <div className="text-xs text-zinc-600 italic pl-2 py-1">No content yet</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SortableItem>
                        )}
                    />
                </div>
            </div>

            {/* The Editor (Columns 2 & 3) */}
            <div className="lg:col-span-2">
                {isCreatingLesson ? (
                    <ContentEditor
                        subjectId={isCreatingLesson.subjectId}
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

            {/* Modals for Native Prompt replacements */}

            {/* New Subject Modal */}
            <Dialog open={isCreatingSubject} onOpenChange={setIsCreatingSubject}>
                <DialogPortal>
                    <DialogOverlay />
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>New Subject</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Subject Name</label>
                            <input
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none"
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                placeholder="e.g. Mathematics"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateSubject()}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setIsCreatingSubject(false)}
                                className="px-4 py-2 hover:bg-white/10 text-zinc-400 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSubject}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </DialogContent>
                </DialogPortal>
            </Dialog>

            {/* New Unit Modal */}
            <Dialog open={!!unitToCreateInSubject} onOpenChange={(open) => !open && setUnitToCreateInSubject(null)}>
                <DialogPortal>
                    <DialogOverlay />
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Add New Unit</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Unit Title</label>
                            <input
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none"
                                value={newUnitTitle}
                                onChange={(e) => setNewUnitTitle(e.target.value)}
                                placeholder="e.g. Algebra I"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateUnitConfirm()}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setUnitToCreateInSubject(null)}
                                className="px-4 py-2 hover:bg-white/10 text-zinc-400 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUnitConfirm}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                Add Unit
                            </button>
                        </div>
                    </DialogContent>
                </DialogPortal>
            </Dialog>

            {/* Delete Unit Confirmation */}
            <AlertDialog open={!!unitToDelete} onOpenChange={(open) => !open && setUnitToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Unit?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you absolutely sure you want to delete this unit and ALL its lessons? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUnitToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUnitConfirm}>Yes, delete it</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
