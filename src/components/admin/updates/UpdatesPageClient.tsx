"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, Plus, Trash, Edit, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// Basic Types (Should be in types/ but locally defined for speed/task isolation)
interface PlatformUpdate {
    id: string;
    title: string;
    content: string;
    version: string | null;
    type: string;
    is_active: boolean;
    created_at: string;
}

export default function UpdatesPageClient({ updates }: { updates: PlatformUpdate[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [version, setVersion] = useState("");
    const [type, setType] = useState("general");

    const handleCreate = async () => {
        if (!title || !content) {
            toast.error("العنوان والمحتوى مطلوبان");
            return;
        }

        try {
            const { error } = await supabase.from('platform_updates').insert({
                title,
                content,
                version,
                type,
                is_active: true // Auto-activate for now
            });

            if (error) throw error;

            toast.success("تم إضافة التحديث بنجاح");
            setIsCreating(false);
            setTitle("");
            setContent("");
            setVersion("");
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("فشل إضافة التحديث");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;
        try {
            await supabase.from('platform_updates').delete().eq('id', id);
            toast.success("تم الحذف");
            router.refresh();
        } catch (err) {
            toast.error("فشل الحذف");
        }
    };

    const togglePublish = async (id: string, current: boolean) => {
        try {
            await supabase.from('platform_updates').update({ is_active: !current }).eq('id', id);
            toast.success(current ? "تم إلغاء النشر" : "تم النشر");
            router.refresh();
        } catch (err) {
            toast.error("فشل التحديث");
        }
    };

    return (
        <div className="container mx-auto max-w-5xl pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Sparkles className="text-blue-500" /> تحديثات النظام
                    </h2>
                    <p className="text-zinc-500">إدارة سجل التغييرات وملاحظات الإصدار.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <Plus size={20} /> تحديث جديد
                </button>
            </div>

            {isCreating && (
                <GlassCard className="mb-8 border-blue-500/30 bg-blue-500/5">
                    <h3 className="text-lg font-bold text-white mb-4">تفاصيل التحديث الجديد</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            placeholder="الإصدار (مثال v2.1.0)"
                            className="bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                        />
                        <select
                            className="bg-black/40 border border-white/10 rounded-lg p-3 text-zinc-400"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="general">عام</option>
                            <option value="feature">ميزة جديدة</option>
                            <option value="bugfix">إصلاح خطأ</option>
                            <option value="security">أمني</option>
                        </select>
                    </div>
                    <input
                        placeholder="عنوان التحديث"
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mb-4"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="المحتوى بالتفصيل..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mb-4 min-h-[100px]"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-zinc-400 hover:text-white">إلغاء</button>
                        <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">نشر التحديث</button>
                    </div>
                </GlassCard>
            )}

            <div className="space-y-4">
                {updates.map((update) => (
                    <GlassCard key={update.id} className="p-6 flex items-start justify-between group">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${update.type === 'feature' ? 'bg-purple-500/20 text-purple-400' :
                                    update.type === 'bugfix' ? 'bg-orange-500/20 text-orange-400' :
                                        update.type === 'security' ? 'bg-green-500/20 text-green-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {update.type}
                                </span>
                                {update.version && <span className="text-zinc-500 font-mono text-xs">{update.version}</span>}
                                <span className="text-zinc-600 text-xs">• {format(new Date(update.created_at), 'PPP')}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{update.title}</h3>
                            <p className="text-zinc-400 text-sm whitespace-pre-wrap">{update.content}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => togglePublish(update.id, update.is_active)}
                                className={`p-2 rounded-lg transition-colors ${update.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-zinc-600 hover:bg-white/5'}`}
                                title={update.is_active ? "إلغاء التفعيل" : "تفعيل"}
                            >
                                {update.is_active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            </button>
                            <button
                                onClick={() => handleDelete(update.id)}
                                className="p-2 rounded-lg text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                    </GlassCard>
                ))}

                {updates.length === 0 && (
                    <div className="p-12 text-center text-zinc-500 bg-white/5 rounded-2xl border border-white/5">
                        لم يتم العثور على تحديثات. ابدأ بإنشاء واحد.
                    </div>
                )}
            </div>
        </div>
    );
}
