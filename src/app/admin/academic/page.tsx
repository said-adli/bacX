"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit2, ChevronLeft, Book, Layers, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Subject { id: string; name: string; icon: string; order: number; }
interface Unit { id: string; name: string; order: number; }
interface Lesson { id: string; title: string; videoUrl: string; duration: string; order: number; isFree: boolean; }

export default function AcademicManager() {
    // Selection State
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    // Data State
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals / Forms State (Simplified for this file)
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemDetails, setNewItemDetails] = useState({ icon: "📚", videoUrl: "", duration: "", isFree: false });

    // --- FETCH SUBJECTS ---
    useEffect(() => {
        const q = query(collection(db, "subjects"), orderBy("order", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSubjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- FETCH UNITS (When Subject Selected) ---
    useEffect(() => {
        if (!selectedSubject) { setUnits([]); return; }
        const q = query(collection(db, "subjects", selectedSubject.id, "units"), orderBy("order", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnits(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Unit)));
        });
        return () => unsubscribe();
    }, [selectedSubject]);

    // --- FETCH LESSONS (When Unit Selected) ---
    useEffect(() => {
        if (!selectedSubject || !selectedUnit) { setLessons([]); return; }
        const q = query(collection(db, "subjects", selectedSubject.id, "units", selectedUnit.id, "lessons"), orderBy("order", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setLessons(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));
        });
        return () => unsubscribe();
    }, [selectedUnit]);

    // --- HANDLERS ---
    const handleAdd = async () => {
        if (!newItemName.trim()) return;
        setIsAdding(true);
        try {
            if (selectedUnit) {
                // Add Lesson
                await addDoc(collection(db, "subjects", selectedSubject!.id, "units", selectedUnit.id, "lessons"), {
                    title: newItemName,
                    videoUrl: newItemDetails.videoUrl,
                    duration: newItemDetails.duration,
                    isFree: newItemDetails.isFree,
                    order: lessons.length + 1,
                    createdAt: new Date()
                });
            } else if (selectedSubject) {
                // Add Unit
                await addDoc(collection(db, "subjects", selectedSubject.id, "units"), {
                    name: newItemName,
                    order: units.length + 1
                });
            } else {
                // Add Subject
                await addDoc(collection(db, "subjects"), {
                    name: newItemName,
                    icon: newItemDetails.icon,
                    order: subjects.length + 1
                });
            }
            toast.success("تمت الإضافة بنجاح");
            setNewItemName("");
            setNewItemDetails({ icon: "📚", videoUrl: "", duration: "", isFree: false });
        } catch (e) {
            toast.error("حدث خطأ");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string, type: 'subject' | 'unit' | 'lesson') => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;
        try {
            if (type === 'lesson') {
                await deleteDoc(doc(db, "subjects", selectedSubject!.id, "units", selectedUnit!.id, "lessons", id));
            } else if (type === 'unit') {
                await deleteDoc(doc(db, "subjects", selectedSubject!.id, "units", id));
                if (selectedUnit?.id === id) setSelectedUnit(null);
            } else {
                await deleteDoc(doc(db, "subjects", id));
                if (selectedSubject?.id === id) { setSelectedSubject(null); setSelectedUnit(null); }
            }
            toast.success("تم الحذف");
        } catch (e) {
            toast.error("فشل الحذف");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">إدارة المسار الدراسي</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">

                {/* COL 1: SUBJECTS */}
                <div className="bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h2 className="font-bold flex items-center gap-2">
                            <Book className="w-4 h-4 text-blue-500" /> المواد
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {subjects.map(sub => (
                            <div
                                key={sub.id}
                                onClick={() => { setSelectedSubject(sub); setSelectedUnit(null); }}
                                className={cn(
                                    "p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group",
                                    selectedSubject?.id === sub.id ? "bg-blue-600/20 border border-blue-600/50" : "hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-xl">{sub.icon}</span>
                                    <span className="font-medium text-sm">{sub.name}</span>
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(sub.id, 'subject'); }} className="p-1.5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/10 bg-white/5 space-y-2">
                        <input
                            placeholder="اسم المادة..."
                            className="w-full bg-black border border-white/20 rounded-lg p-2 text-sm"
                            value={!selectedSubject ? newItemName : ""}
                            onChange={(e) => !selectedSubject && setNewItemName(e.target.value)}
                            disabled={!!selectedSubject}
                        />
                        <input
                            placeholder="الأيقونة (Emoji)..."
                            className="w-full bg-black border border-white/20 rounded-lg p-2 text-sm"
                            value={!selectedSubject ? newItemDetails.icon : ""}
                            onChange={(e) => !selectedSubject && setNewItemDetails({ ...newItemDetails, icon: e.target.value })}
                            disabled={!!selectedSubject}
                        />
                        <button
                            disabled={!!selectedSubject || isAdding}
                            onClick={handleAdd}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" /> إضافة مادة
                        </button>
                    </div>
                </div>

                {/* COL 2: UNITS */}
                <div className={cn("bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden transition-all", !selectedSubject && "opacity-50 pointer-events-none")}>
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h2 className="font-bold flex items-center gap-2">
                            <Layers className="w-4 h-4 text-purple-500" /> الوحدات
                            {selectedSubject && <span className="text-xs text-zinc-500">({selectedSubject.name})</span>}
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {units.map(unit => (
                            <div
                                key={unit.id}
                                onClick={() => setSelectedUnit(unit)}
                                className={cn(
                                    "p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group",
                                    selectedUnit?.id === unit.id ? "bg-purple-600/20 border border-purple-600/50" : "hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <span className="font-medium text-sm">الوحدة {unit.order}: {unit.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(unit.id, 'unit'); }} className="p-1.5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/10 bg-white/5 space-y-2">
                        <input
                            placeholder="اسم الوحدة..."
                            className="w-full bg-black border border-white/20 rounded-lg p-2 text-sm"
                            value={selectedSubject && !selectedUnit ? newItemName : ""}
                            onChange={(e) => selectedSubject && !selectedUnit && setNewItemName(e.target.value)}
                            disabled={!selectedSubject || !!selectedUnit}
                        />
                        <button
                            disabled={!selectedSubject || !!selectedUnit || isAdding}
                            onClick={handleAdd}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" /> إضافة وحدة
                        </button>
                    </div>
                </div>

                {/* COL 3: LESSONS */}
                <div className={cn("bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden transition-all", !selectedUnit && "opacity-50 pointer-events-none")}>
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h2 className="font-bold flex items-center gap-2">
                            <FileVideo className="w-4 h-4 text-green-500" /> الدروس
                            {selectedUnit && <span className="text-xs text-zinc-500">({selectedUnit.name})</span>}
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {lessons.map(lesson => (
                            <div
                                key={lesson.id}
                                className="p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all flex justify-between items-center group"
                            >
                                <div>
                                    <div className="font-medium text-sm line-clamp-1">{lesson.title}</div>
                                    <div className="text-xs text-zinc-500 flex gap-2">
                                        <span>{lesson.duration}</span>
                                        {lesson.isFree && <span className="text-green-500">مجاني</span>}
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(lesson.id, 'lesson')} className="p-1.5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/10 bg-white/5 space-y-2">
                        <input
                            placeholder="عنوان الدرس..."
                            className="w-full bg-black border border-white/20 rounded-lg p-2 text-sm"
                            value={selectedUnit ? newItemName : ""}
                            onChange={(e) => selectedUnit && setNewItemName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <input
                                placeholder="Youtube ID..."
                                className="w-2/3 bg-black border border-white/20 rounded-lg p-2 text-sm"
                                value={selectedUnit ? newItemDetails.videoUrl : ""}
                                onChange={(e) => selectedUnit && setNewItemDetails({ ...newItemDetails, videoUrl: e.target.value })}
                            />
                            <input
                                placeholder="20:00"
                                className="w-1/3 bg-black border border-white/20 rounded-lg p-2 text-sm"
                                value={selectedUnit ? newItemDetails.duration : ""}
                                onChange={(e) => selectedUnit && setNewItemDetails({ ...newItemDetails, duration: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox" id="isFree"
                                checked={newItemDetails.isFree}
                                onChange={(e) => setNewItemDetails({ ...newItemDetails, isFree: e.target.checked })}
                            />
                            <label htmlFor="isFree" className="text-sm text-zinc-400">درس مجاني (Free Preview)</label>
                        </div>
                        <button
                            disabled={!selectedUnit || isAdding}
                            onClick={handleAdd}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" /> إضافة درس
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
