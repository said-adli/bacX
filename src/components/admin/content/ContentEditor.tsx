"use client";

import { useState, useEffect } from "react";
import { Lesson, createLesson, updateLesson, deleteLesson } from "@/actions/admin-content";
import { SubscriptionPlan } from "@/actions/admin-plans";
import { toast } from "sonner";
import { Video, Radio, FileText, ArrowLeft, Trash2, Save, Lock as LockIcon, X, Loader2, Download } from "lucide-react";
import { ResourceUploader, ResourceFile } from "@/components/admin/ResourceUploader";
import { createClient } from "@/utils/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";

interface ContentEditorProps {
    unitId: string;
    initialData?: Lesson;
    activePlans: SubscriptionPlan[];
    onClose: () => void;
}

interface AttachedResource extends ResourceFile {
    id?: string; // Optional because new uploads won't have DB ID immediately
}

export default function ContentEditor({ unitId, initialData, activePlans, onClose }: ContentEditorProps) {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        type: (initialData?.type || "video") as "video" | "live_stream" | "pdf",
        video_url: initialData?.video_url || "",
        required_plan_id: initialData?.required_plan_id || "",
        is_free: initialData?.is_free || false,
        is_purchasable: initialData?.is_purchasable || false,
        price: initialData?.price || null,
        scheduled_at: "" // [NEW] for Live Creation
    });
    const [isSaving, setIsSaving] = useState(false);

    // [NEW] Resource State
    const [resources, setResources] = useState<AttachedResource[]>([]);
    const [isLoadingResources, setIsLoadingResources] = useState(false);

    // [NEW] Supabase Client for Resource Operations
    const supabase = createClient();

    // [NEW] Fetch Existing Resources
    useEffect(() => {
        if (isEditing && initialData?.id) {
            fetchResources(initialData.id);
        }
    }, [initialData, isEditing]);

    async function fetchResources(lessonId: string) {
        setIsLoadingResources(true);
        const { data, error } = await supabase
            .from('lesson_resources')
            .select('*')
            .eq('lesson_id', lessonId);

        if (data) {
            setResources(data as AttachedResource[]);
        }
        setIsLoadingResources(false);
    }

    const handleResourceUpload = (file: ResourceFile) => {
        setResources(prev => [...prev, file]);
    };

    const handleRemoveResource = async (index: number, resourceId?: string) => {
        if (resourceId) {
            // Delete from DB immediately if it exists
            const { error } = await supabase.from('lesson_resources').delete().eq('id', resourceId);
            if (error) {
                toast.error("Failed to delete resource");
                return;
            }
        }
        // Update UI
        setResources(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!formData.title) return toast.error("Title is required");

        setIsSaving(true);
        try {
            const payload = {
                title: formData.title,
                type: formData.type,
                video_url: formData.video_url,
                required_plan_id: formData.required_plan_id || null, // Granular Access Logic
                unit_id: unitId,
                is_free: formData.is_free,
                is_purchasable: formData.is_purchasable,
                price: formData.price,
                // Pass scheduled_at via extended payload if we update the action signature or rely on it being in `data` (partial)
                // But `createLesson` takes Partial<Lesson>, and LessonDTO doesn't have scheduled_at yet.
                // We need to pass it. I will append it to the payload object cast as any or extend the type.
                // Given the instruction "add scheduled_at to form", I'll send it.
                scheduled_at: formData.scheduled_at
            };

            let lessonId = initialData?.id;

            if (isEditing && initialData) {
                await updateLesson(initialData.id, payload);
                toast.success("Changes saved");
            } else {
                // Modified createLesson now returns the new record
                const newLesson = await createLesson(payload);
                lessonId = newLesson?.id;
                toast.success("Lesson created");
            }

            // [NEW] Persist Resources
            if (lessonId && resources.length > 0) {
                // Filter out resources that are already saved (have an ID)
                const newResources = resources.filter(r => !r.id).map(r => ({
                    lesson_id: lessonId,
                    title: r.title,
                    file_url: r.file_url,
                    file_type: r.file_type,
                    file_size: r.file_size
                }));

                if (newResources.length > 0) {
                    const { error } = await supabase.from('lesson_resources').insert(newResources);
                    if (error) console.error("Resource Save Error", error);
                }
            }

            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Failed to save Content");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData || !confirm("Delete this lesson permanently?")) return;
        try {
            await deleteLesson(initialData.id);
            toast.success("Deleted");
            onClose();
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="h-full bg-black/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col backdrop-blur-md">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-zinc-400" />
                    </button>
                    <h2 className="text-xl font-bold text-white">
                        {isEditing ? "Edit Content" : "New Content Item"}
                    </h2>
                </div>
                {isEditing && (
                    <button onClick={handleDelete} className="text-red-500 hover:text-red-400 p-2">
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">

                {/* Type Selection */}
                <div className="grid grid-cols-3 gap-4">
                    {['video', 'live_stream', 'pdf'].map((t) => (
                        <div
                            key={t}
                            onClick={() => setFormData({ ...formData, type: t as "video" | "live_stream" | "pdf" })}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 ${formData.type === t ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5'}`}
                        >
                            {t === 'video' && <Video size={24} />}
                            {t === 'live_stream' && <Radio size={24} />}
                            {t === 'pdf' && <FileText size={24} />}
                            <span className="text-xs font-bold uppercase tracking-wider">{t.replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>

                {/* Main Fields */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Title</label>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none text-lg font-bold placeholder:font-normal"
                            placeholder="e.g. Introduction to Calculus"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {formData.type !== 'pdf' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                                    {formData.type === 'live_stream' ? 'Stream URL / ID' : 'Video Source URL'}
                                </label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-mono text-zinc-300 focus:border-blue-500 outline-none"
                                    placeholder="https://..."
                                    value={formData.video_url}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                />
                            </div>

                            {formData.type === 'live_stream' && (
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                                        Scheduled Start Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                        value={formData.scheduled_at}
                                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Granular Access Control */}
                    <div className="p-6 rounded-2xl bg-blue-900/10 border border-blue-500/20">
                        <h4 className="text-blue-400 font-bold text-sm mb-4 flex items-center gap-2">
                            <LockIcon size={14} /> Access Control
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Required Plan</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    value={formData.required_plan_id || ""}
                                    onChange={(e) => setFormData({ ...formData, required_plan_id: e.target.value })}
                                >
                                    <option value="">Public / Free</option>
                                    {activePlans.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} ({plan.price}DA)
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-zinc-500 mt-2">
                                    Only students with this specific active subscription can view this content.
                                </p>
                            </div>

                            {/* Toggle Public */}
                            <div className="flex items-center gap-3 mt-6">
                                <div
                                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${formData.is_free ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                    onClick={() => setFormData({ ...formData, is_free: !formData.is_free })}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.is_free ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-sm font-medium text-zinc-300">Is Free Preview?</span>
                            </div>
                        </div>

                        {/* Lifetime Purchase Toggle */}
                        <div className="mt-6 pt-6 border-t border-blue-500/20">
                            <h5 className="text-xs font-bold text-blue-300 uppercase mb-3 flex items-center gap-2">
                                Lifetime Ownership
                            </h5>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${formData.is_purchasable ? 'bg-purple-500' : 'bg-zinc-700'}`}
                                        onClick={() => setFormData({ ...formData, is_purchasable: !formData.is_purchasable })}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.is_purchasable ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-300">Enable Purchase</span>
                                </div>

                                {formData.is_purchasable && (
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none text-sm"
                                            placeholder="Price (DA)"
                                            value={formData.price || ''}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attachments Section */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                        Attached Resources (PDFs, Images)
                    </label>

                    {/* Uploder */}
                    <ResourceUploader onUploadComplete={handleResourceUpload} />

                    {/* List */}
                    {isLoadingResources ? (
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading resources...
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {resources.map((res, i) => (
                                <GlassCard key={i} className="p-3 flex items-center justify-between hover:bg-white/5 border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <FileText size={16} />
                                        </div>
                                        <div className="text-sm">
                                            <div className="text-white font-medium line-clamp-1">{res.title}</div>
                                            <div className="text-xs text-zinc-500">{(res.file_size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={res.file_url} target="_blank" className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                                            <Download size={14} />
                                        </a>
                                        <button
                                            onClick={() => handleRemoveResource(i, res.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-full text-zinc-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                    {isSaving ? "Saving..." : <><Save size={18} /> Save Content</>}
                </button>
            </div>
        </div>
    );
}
