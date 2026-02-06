"use client";

import { useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Metadata for an uploaded resource
 */
export interface ResourceFile {
    title: string;
    file_url: string;
    file_type: 'pdf' | 'image' | 'other';
    file_size: number;
}

interface ResourceUploaderProps {
    onUploadComplete: (resource: ResourceFile) => void;
    className?: string;
}

export function ResourceUploader({ onUploadComplete, className }: ResourceUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const supabase = createClient();

    // Handle File Selection
    const handleFile = async (file: File) => {
        if (!file) return;

        // Validation
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error("نوع الملف غير مدعوم. يرجى رفع PDF أو صورة.");
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error("حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت.");
            return;
        }

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('course-materials')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Store PATH, not URL. The backend will generate Signed URLs on demand.
            // P0 FIX: Removed getPublicUrl. We never expose public links for private content.

            const resource: ResourceFile = {
                title: file.name.replace(`.${fileExt}`, ''),
                file_url: filePath, // Storing PATH now.
                // The frontend (LessonContent) will parse this to extract the path 
                // and request a Signed URL via Server Action.
                file_type: 'other', // Defaulting to 'other' or logic needed if you want specific types
                file_size: file.size
            };

            onUploadComplete(resource);
            toast.success("تم رفع الملف بنجاح");

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error("Upload error:", error);
            toast.error("فشل رفع الملف: " + message);
        } finally {
            setIsUploading(false);
        }
    };

    // Drag & Drop Handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className={cn("w-full", className)}>
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group",
                    dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
                    isUploading && "pointer-events-none opacity-50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleChange}
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground font-medium">جاري الرفع...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-1">
                            اضغط للرفع أو اسحب الملف هنا
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-[200px]">
                            PDF, JPG, PNG (Max 10MB)
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
