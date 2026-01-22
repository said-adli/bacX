"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
    LayoutGrid, BookOpen, Plus, Trash2, Edit2,
    Video, FileText, ChevronDown, ChevronRight, File, Loader2, UploadCloud, Database
} from "lucide-react";
import { toast } from "sonner";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";

interface Lesson {
    id: string;
    title: string;
    duration: string;
    video_url?: string;
    pdf_url?: string;
    type: 'lesson' | 'exercise'; // [NEW] Content Type
}

interface Subject {
    id: string;
    name: string;
    icon: string;
    color: string;
    lessons: Lesson[];
}

export default function ContentManagerPage() {
    const isVisible = usePageVisibility();
    const { role } = useAuth();
    const supabase = createClient();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    // Form State
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false); // [NEW] Upload Progress State
    const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false); // [NEW] Subject Form State

    useEffect(() => {
        // Relaxed role check for demo/dev if needed, but keeping admin for safety
        if (role === "admin") {
            fetchContent();
        }
    }, [role]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            // Fetch Subjects
            const { data: subjectsData, error: subjectsError } = await supabase
                .from('subjects')
                .select('*')
                .order('name');

            if (subjectsError) throw subjectsError;

            // Fetch Lessons
            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .order('title');

            if (lessonsError) throw lessonsError;

            // Merge
            const merged = subjectsData.map((subject: any) => ({
                ...subject,
                lessons: lessonsData.filter((l: any) => l.subject_id === subject.id)
            }));

            setSubjects(merged);

        } catch (err) {
            console.error(err);
            toast.error("فشل في تحميل المحتوى");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;

        try {
            const { error } = await supabase
                .from('lessons')
                .delete()
                .eq('id', lessonId);

            if (error) throw error;

            toast.success("تم الحذف بنجاح");
            fetchContent();
        } catch (err) {
            toast.error("فشل الحذف");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileName = `pdfs/${Date.now()}_${file.name.replace(/\s+/g, '-')}`;
            const { data, error } = await supabase.storage
                .from('lesson-materials')
                .upload(fileName, file);

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('lesson-materials')
                .getPublicUrl(fileName);

            // Update form (we need to manually manage this field or just use hidden input)
            // Ideally we update a state or simply putting it in the hidden input is tricky without controlled component.
            // Let's use a ref or state for the PDF URL. 
            // Better: Update editingLesson or a temp state.
            // Since we use native form submission, let's just populate a hidden input's value or 
            // update a visual state.

            // Hack for native form: set value of a hidden input
            const hiddenInput = document.getElementById('pdf-url-hidden') as HTMLInputElement;
            if (hiddenInput) {
                hiddenInput.value = publicUrl;
                toast.success("تم رفع الملف بنجاح");
            }

        } catch (error) {
            console.error("Upload failed", error);
            toast.error("فشل رفع الملف");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveLesson = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const duration = formData.get("duration") as string;
        const video_url = formData.get("video_url") as string;
        const pdf_url = formData.get("pdf_url") as string;
        const type = formData.get("type") as 'lesson' | 'exercise'; // [NEW] Get Type

        try {
            if (editingLesson) {
                // Update
                const { error } = await supabase
                    .from('lessons')
                    .update({ title, duration, video_url, pdf_url, type })
                    .eq('id', editingLesson.id);
                if (error) throw error;
                toast.success("تم التحديث بنجاح");
            } else {
                // Create
                const { error } = await supabase
                    .from('lessons')
                    .insert([{
                        id: crypto.randomUUID(),
                        subject_id: activeSubjectId,
                        title,
                        duration,
                        video_url,
                        pdf_url,
                        type: type || 'lesson'
                    }]);
                if (error) throw error;
                toast.success("تمت الإضافة بنجاح");
            }
            setIsFormOpen(false);
            setEditingLesson(null);
            fetchContent();
        } catch (err) {
            toast.error("حدث خطأ");
        }
    };

    // [NEW] Handle Create Subject
    const handleSaveSubject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const icon = formData.get("icon") as string;

        // Random color assignment
        const colors = ['blue', 'green', 'purple', 'red', 'orange', 'pink', 'indigo', 'cyan'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        try {
            const { error } = await supabase
                .from('subjects')
                .insert([{
                    id: crypto.randomUUID(),
                    name,
                    icon,
                    color: randomColor
                }]);

            if (error) throw error;

            toast.success("تم إضافة المادة بنجاح");
            setIsSubjectFormOpen(false);
            fetchContent();
        } catch (err) {
            console.error(err);
            toast.error("فشل إضافة المادة");
        }
    };

    // if (role !== "admin") return <div className="p-10 text-white">Access Denied</div>;

    return (
        <div className={`space-y-6 animate-in fade-in zoom-in duration-500 pb-20 ${!isVisible ? "animations-paused" : ""}`}>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white font-serif flex items-center gap-3">
                    <BookOpen className="text-blue-400" />
                    إدارة المحتوى (CMS)
                </h1>
                <button
                    onClick={() => {
                        setIsSubjectFormOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
                >
                    <Plus size={18} />
                    مادة جديدة
                </button>
            </div>

            {/* Empty State */}
            {!loading && subjects.length === 0 && (
                <div className="mt-10">
                    <AdminEmptyState
                        title="لا يوجد محتوى (No Content)"
                        description="قاعدة البيانات فارغة. يجب عليك تشغيل ملف SQL لإضافة المواد الدراسية."
                        icon="database"
                    >
                        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
                            ⚠️ <strong>تنبيه:</strong> لم يتم العثور على أي مواد. يرجى تشغيل SQL Seed Data.
                        </div>
                    </AdminEmptyState>
                </div>
            )}

            {/* List of Subjects */}
            <div className="space-y-4">
                {subjects.map(subject => (
                    <GlassCard key={subject.id} className="p-0 overflow-hidden">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-${subject.color}-500/20`}>
                                    {subject.icon}
                                </div>
                                <h2 className="text-xl font-bold text-white">{subject.name}</h2>
                                <span className="text-sm text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                                    {subject.lessons.length} درس
                                </span>
                            </div>
                            {expandedSubject === subject.id ? <ChevronDown /> : <ChevronRight />}
                        </div>

                        {/* Lessons List (Expanded) */}
                        {expandedSubject === subject.id && (
                            <div className="bg-black/20 p-4 border-t border-white/5 space-y-2">
                                <button
                                    onClick={() => {
                                        setActiveSubjectId(subject.id);
                                        setEditingLesson(null);
                                        setIsFormOpen(true);
                                    }}
                                    className="w-full py-3 mb-4 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 text-white/60 hover:text-white hover:border-white/40 transition-all font-bold"
                                >
                                    <Plus size={18} />
                                    إضافة درس جديد
                                </button>

                                {subject.lessons.map(lesson => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                                <Video size={14} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold">{lesson.title}</h4>
                                                <p className="text-xs text-white/40">{lesson.duration}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setActiveSubjectId(subject.id);
                                                    setEditingLesson(lesson);
                                                    setIsFormOpen(true);
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-blue-400"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                ))}
            </div>

            {/* Subject Creation Modal */}
            {isSubjectFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-sm p-6 relative">
                        <button
                            onClick={() => setIsSubjectFormOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-6">
                            إضافة مادة جديدة
                        </h2>
                        <form onSubmit={handleSaveSubject} className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1">اسم المادة (مثال: الفيزياء)</label>
                                <input
                                    name="name"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="ادخل اسم المادة..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">الأيقونة (إيموجي)</label>
                                <input
                                    name="icon"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 text-center text-2xl"
                                    placeholder="⚛️"
                                    maxLength={2}
                                    required
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSubjectFormOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20"
                                >
                                    إضافة المادة
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Edit/Add Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingLesson ? "تعديل الدرس" : "إضافة درس جديد"}
                        </h2>
                        <form onSubmit={handleSaveLesson} className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1">عنوان الدرس</label>
                                <input
                                    name="title"
                                    defaultValue={editingLesson?.title}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">المدة</label>
                                    <input
                                        name="duration"
                                        defaultValue={editingLesson?.duration || "00:00:00"}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-white/60 mb-2">نوع المحتوى</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="lesson"
                                                defaultChecked={editingLesson?.type === 'lesson' || !editingLesson}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-600 bg-gray-700 border-gray-600"
                                            />
                                            <span className="text-white">درس (Lesson)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="exercise"
                                                defaultChecked={editingLesson?.type === 'exercise'}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-600 bg-gray-700 border-gray-600"
                                            />
                                            <span className="text-white">تمرين (Exercise)</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-white/60 mb-1">رابط الفيديو (ID or URL)</label>
                                    <input
                                        name="video_url"
                                        defaultValue={editingLesson?.video_url}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-white/60 mb-1">ملف الدرس (PDF)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="hidden"
                                            id="pdf-url-hidden"
                                            name="pdf_url"
                                            defaultValue={editingLesson?.pdf_url}
                                        />
                                        <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                                    <span className="text-sm text-white/60">جاري الرفع...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-5 h-5 text-blue-400" />
                                                    <span className="text-sm text-white/60">اضغط لرفع ملف</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-1">سيتم حفظ الرابط تلقائياً بعد اكتمال الرفع.</p>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20"
                                >
                                    حفظ التغييرات
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
