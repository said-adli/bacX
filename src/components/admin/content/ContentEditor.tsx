"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lesson, createLesson, updateLesson, deleteLesson, deleteLessonResource, getContentTree, Subject } from "@/actions/admin-content";
import { SubscriptionPlan, getActivePlans } from "@/actions/admin-plans";
import { toast } from "sonner";
import { Video, Radio, FileText, ArrowLeft, Trash2, Save, Lock as LockIcon, X, Loader2, Download } from "lucide-react";
import { ResourceUploader, ResourceFile } from "@/components/admin/ResourceUploader";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

const lessonSchema = z.object({
    subject_id: z.string().min(1, "الرجاء اختيار المادة"),
    unit_id: z.string().min(1, "الرجاء اختيار الوحدة"),
    title: z.string().min(1, "العنوان مطلوب"),
    type: z.enum(["video", "live_stream", "pdf"]),
    video_url: z.string().optional(),
    required_plan_id: z.string().optional(),
    is_free: z.boolean(),
    is_purchasable: z.boolean(),
    price: z.number().nullable().optional(),
    scheduled_at: z.string().optional()
});

type LessonFormValues = z.infer<typeof lessonSchema>;

interface ContentEditorProps {
    subjectId?: string;
    unitId?: string;
    initialData?: Lesson & { _resources?: any[] };
    activePlans?: SubscriptionPlan[];
    onClose: () => void;
}

interface AttachedResource extends ResourceFile {
    id?: string;
}

export default function ContentEditor({ subjectId, unitId, initialData, activePlans: initialPlans, onClose }: ContentEditorProps) {
    const isEditing = !!initialData;
    const [resources, setResources] = useState<AttachedResource[]>(initialData?._resources || []);
    const [isSaving, setIsSaving] = useState(false);
    const [trees, setTrees] = useState<Subject[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans || []);

    const form = useForm<LessonFormValues>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            subject_id: subjectId || "",
            unit_id: unitId || "",
            title: initialData?.title || "",
            type: (initialData?.type || "video") as "video" | "live_stream" | "pdf",
            video_url: initialData?.video_url || "",
            required_plan_id: initialData?.required_plan_id || "",
            is_free: initialData?.is_free || false,
            is_purchasable: initialData?.is_purchasable || false,
            price: initialData?.price || null,
            scheduled_at: "" // Set initial schedule safely?
        }
    });

    const watchType = form.watch("type");
    const watchPurchasable = form.watch("is_purchasable");
    const watchSubjectId = form.watch("subject_id");
    const watchIsFree = form.watch("is_free");

    useEffect(() => {
        const loadGlobals = async () => {
            if (!subjectId || !unitId) {
                const ts = await getContentTree();
                setTrees(ts);
            }
            if (!initialPlans) {
                const ps = await getActivePlans();
                setPlans(ps);
            }
        };
        loadGlobals();
    }, [subjectId, unitId, initialPlans]);

    const activeUnits = trees.find(t => t.id === watchSubjectId)?.units || [];

    const handleResourceUpload = (file: ResourceFile) => {
        setResources(prev => [...prev, file]);
    };

    const handleRemoveResource = async (index: number, resourceId?: string) => {
        if (resourceId) {
            try {
                await deleteLessonResource(resourceId);
            } catch (error) {
                toast.error("فشل حذف الملحق");
                return;
            }
        }
        setResources(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (values: LessonFormValues) => {
        setIsSaving(true);
        try {
            const payload = {
                title: values.title,
                type: values.type,
                video_url: values.video_url,
                required_plan_id: values.required_plan_id || null,
                unit_id: values.unit_id,
                subject_id: values.subject_id,
                is_free: values.is_free,
                is_purchasable: values.is_purchasable,
                price: values.price,
                scheduled_at: values.scheduled_at
            };

            const unpersistedResources = resources.filter(r => !r.id);

            if (isEditing && initialData) {
                await updateLesson(initialData.id, payload, unpersistedResources);
                toast.success("تم حفظ التغييرات");
            } else {
                const res = await createLesson(payload, unpersistedResources);
                if (res && 'error' in res) {
                    toast.error(res.error as string);
                    return;
                }
                toast.success("تم إضافة الدرس بنجاح");
            }

            onClose();
        } catch (e) {
            console.error(e);
            toast.error("فشل حفظ المحتوى");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData) return;
        try {
            await deleteLesson(initialData.id);
            toast.success("تم الحذف بنجاح");
            onClose();
        } catch (e) {
            toast.error("فشل الحذف");
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full bg-black/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col backdrop-blur-md">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-zinc-400" />
                    </button>
                    <h2 className="text-xl font-bold text-white">
                        {isEditing ? "تعديل المحتوى" : "إضافة محتوى جديد"}
                    </h2>
                </div>
                {isEditing && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button type="button" className="text-red-500 hover:text-red-400 p-2">
                                <Trash2 size={20} />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>حذف الدرس؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                    لا يمكن التراجع عن هذا الإجراء. سيتم حذف هذا الدرس وجميع ملحقاته بشكل نهائي.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">حذف نهائي</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">

                {/* Dynamic Hierarchy Selection if no subjectId passed (Global Quick Add) */}
                {(!subjectId || !unitId) && (
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">اختر المادة</label>
                            <Select
                                value={watchSubjectId || undefined}
                                onValueChange={(val) => {
                                    form.setValue("subject_id", val);
                                    form.setValue("unit_id", ""); // Reset unit when subject changes
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- اختر المادة --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {trees.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.subject_id && <span className="text-xs text-red-500 mt-1">{form.formState.errors.subject_id.message}</span>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">اختر الوحدة</label>
                            <Select
                                disabled={!watchSubjectId}
                                value={form.watch("unit_id") || undefined}
                                onValueChange={(val) => form.setValue("unit_id", val)}
                            >
                                <SelectTrigger className={!watchSubjectId ? "opacity-50" : ""}>
                                    <SelectValue placeholder="-- اختر الوحدة --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {activeUnits.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.unit_id && <span className="text-xs text-red-500 mt-1">{form.formState.errors.unit_id.message}</span>}
                        </div>
                    </div>
                )}

                {/* Type Selection */}
                <div className="grid grid-cols-3 gap-4">
                    {(['video', 'live_stream', 'pdf'] as const).map((t) => (
                        <div
                            key={t}
                            onClick={() => form.setValue("type", t)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 ${watchType === t ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5'}`}
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
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">العنوان</label>
                        <input
                            {...form.register("title")}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none text-lg font-bold placeholder:font-normal"
                            placeholder="مثال: مقدمة في الرياضيات"
                        />
                        {form.formState.errors.title && <span className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</span>}
                    </div>

                    {watchType !== 'pdf' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                                    {watchType === 'live_stream' ? 'رابط / معرف البث المباشر' : 'رابط مصدر الفيديو'}
                                </label>
                                <input
                                    {...form.register("video_url")}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-mono text-zinc-300 focus:border-blue-500 outline-none"
                                    placeholder="https://..."
                                />
                            </div>

                            {watchType === 'live_stream' && (
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                                        موعد البدء المجدول
                                    </label>
                                    <input
                                        type="datetime-local"
                                        {...form.register("scheduled_at")}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Granular Access Control */}
                    <div className="p-6 rounded-2xl bg-blue-900/10 border border-blue-500/20">
                        <h4 className="text-blue-400 font-bold text-sm mb-4 flex items-center gap-2">
                            <LockIcon size={14} /> صلاحيات الوصول
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase">الباقة المطلوبة</label>
                                    {plans.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => form.setValue("required_plan_id", plans[0].id)}
                                            className="text-[10px] bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-2 py-1 rounded-md transition-colors"
                                        >
                                            ⚡ ربط سريع بالباقة الأساسية
                                        </button>
                                    )}
                                </div>
                                <Select
                                    value={form.watch("required_plan_id") || "public"}
                                    onValueChange={(val) => form.setValue("required_plan_id", val === "public" ? "" : val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="عام / مجاني" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="public">عام / مجاني</SelectItem>
                                            {plans.map(plan => (
                                                <SelectItem key={plan.id} value={plan.id}>
                                                    <div className="flex justify-between items-center w-full min-w-[200px] pr-4">
                                                        <span className="font-bold">{plan.name}</span>
                                                        <span className="text-blue-400 text-xs bg-blue-500/10 px-2 py-0.5 rounded-full ml-4">
                                                            {plan.price.toLocaleString()} DA
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-zinc-500 mt-2">
                                    فقط الطلبة الذين يمتلكون اشتراكاً نشطاً في هذه الباقة يمكنهم مشاهدة هذا المحتوى.
                                </p>
                            </div>

                            {/* Toggle Public */}
                            <div className="flex items-center gap-3 mt-6">
                                <div
                                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${watchIsFree ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                    onClick={() => form.setValue("is_free", !watchIsFree)}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${watchIsFree ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-sm font-medium text-zinc-300">هل هذا عرض مجاني؟</span>

                                {/* Hidden input to register with hook form */}
                                <input type="hidden" {...form.register("is_free")} />
                            </div>
                        </div>

                        {/* Lifetime Purchase Toggle */}
                        <div className="mt-6 pt-6 border-t border-blue-500/20">
                            <h5 className="text-xs font-bold text-blue-300 uppercase mb-3 flex items-center gap-2">
                                ملكية مدى الحياة
                            </h5>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${watchPurchasable ? 'bg-purple-500' : 'bg-zinc-700'}`}
                                        onClick={() => form.setValue("is_purchasable", !watchPurchasable)}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${watchPurchasable ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-300">تفعيل الشراء</span>
                                    {/* Hidden input to register with hook form */}
                                    <input type="hidden" {...form.register("is_purchasable")} />
                                </div>

                                {watchPurchasable && (
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none text-sm"
                                            placeholder="السعر (دج)"
                                            {...form.register("price", { valueAsNumber: true })}
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
                        الملحقات المرفقة (PDF، صور)
                    </label>

                    <ResourceUploader onUploadComplete={handleResourceUpload} />

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
                                    <a href={res.file_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                                        <Download size={14} />
                                    </a>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button type="button" className="p-2 hover:bg-red-500/10 rounded-full text-zinc-400 hover:text-red-500 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>إزالة الملحق؟</AlertDialogTitle>
                                                <AlertDialogDescription>هل أنت متأكد من رغبتك في إزالة هذا الملحق؟</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleRemoveResource(i, res.id)}>إزالة</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </GlassCard>
                        ))}
                        {resources.length === 0 && (
                            <div className="text-xs text-zinc-600 italic">لم يتم إرفاق أي ملحقات بعد.</div>
                        )}
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                    {isSaving ? "جاري الحفظ..." : <><Save size={18} /> حفظ المحتوى</>}
                </button>
            </div>
        </form>
    );
}
