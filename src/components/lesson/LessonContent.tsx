"use client";

import { useEffect, useState } from "react";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import { Sidebar } from "@/components/lesson/Sidebar";
import { createClient } from "@/utils/supabase/client";
import { FileText, Download, Lock, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";

interface LessonContentProps {
    id: string; // This is the Lesson ID
    title: string;
    description: string;
    videoUrl: string; // Legacy/Unused by SecurePlayer (it fetches internally)
}

interface LessonResource {
    id: string;
    title: string;
    file_url: string;
    file_type: 'pdf' | 'image' | 'other';
    file_size: number;
}

export default function LessonContent({ id, title, description }: LessonContentProps) {
    // [NEW] Resources State
    const [resources, setResources] = useState<LessonResource[]>([]);
    const [isLoadingResources, setIsLoadingResources] = useState(true);
    const supabase = createClient();

    // [NEW] Fetch Resources Effect
    useEffect(() => {
        async function fetchResources() {
            try {
                // RLS will handle security. If user has no access, this returns empty or error.
                const { data, error } = await supabase
                    .from('lesson_resources')
                    .select('*')
                    .eq('lesson_id', id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching resources:", error);
                } else if (data) {
                    setResources(data as LessonResource[]);
                }
            } catch (e) {
                console.error("Resource fetch exception", e);
            } finally {
                setIsLoadingResources(false);
            }
        }

        if (id) {
            fetchResources();
        }
    }, [id]);

    const handleDownload = async (resource: LessonResource) => {
        try {
            toast.info(`جاري تحضير الملف الآمن...`);

            // Extract the storage path from the full URL or just store the path in DB?
            // The DB stores `file_url`. If it's a full URL, we need to extract the path.
            // Assuming `file_url` is something like "https://.../storage/v1/object/public/course-materials/filename.pdf"
            // We need just "filename.pdf".

            // If the upload stores just the path, great. If full URL, we parse.
            // Based on ResourceUploader, it stores `publicUrl`. We need to extract the path relative to the bucket.
            const urlObj = new URL(resource.file_url);
            const pathParts = urlObj.pathname.split('/course-materials/');
            if (pathParts.length < 2) {
                // Fallback: maybe it's just the filename in the DB?
                window.open(resource.file_url, '_blank');
                return;
            }
            const storagePath = decodeURIComponent(pathParts[1]);

            // Call Server Action
            const { getLessonResource } = await import('@/actions/secure-storage');
            const signedUrl = await getLessonResource(id, storagePath);

            window.open(signedUrl, '_blank');
        } catch (e: any) {
            console.error("Download error:", e);
            toast.error(e.message || "فشل تحميل الملف - اشتراكك لا يسمح بذلك");
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h1 className="font-tajawal font-bold text-2xl sm:text-3xl lg:text-4xl mb-2 text-white/90">
                        {title}
                    </h1>
                    <p className="font-tajawal text-zinc-400 text-lg">
                        {description}
                    </p>
                </div>

                {/* SECURE PLAYER INTEGRATION */}
                {/* 
                   Replaces the old "Ghost Player" portal. 
                   Passes lessonId directly so the player can verify auth & fetch video ID securely.
                */}
                <SecureVideoPlayer lessonId={id} title={title} />

                {/* [NEW] Resources Section */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        الملفات والمرفقات
                    </h2>

                    {isLoadingResources ? (
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" /> جاري تحميل المرفقات...
                        </div>
                    ) : resources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {resources.map((resource) => (
                                <GlassCard
                                    key={resource.id}
                                    className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer border-white/5"
                                    onClick={() => handleDownload(resource)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            {resource.file_type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">{resource.title}</h4>
                                            <span className="text-xs text-zinc-500">
                                                {(resource.file_size / 1024 / 1024).toFixed(2)} MB • {resource.file_type.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all">
                                        <Download size={14} />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-zinc-500 text-sm">
                            لا توجد ملفات مرفقة مع هذا الدرس.
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-1 h-full">
                <Sidebar />
            </div>
        </div>
    );
}
