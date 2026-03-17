"use client";

import { useState, useRef } from "react";
import { HeroSlide, createHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlides } from "@/actions/admin-hero";
import { createClient } from "@/utils/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { SmartButton } from "@/components/ui/SmartButton";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Link2, Type, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

// Image Compressor Utility (Reduces to Max 1920x1080, WebP 80%)
const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Canvas to Blob failed"));
                }, "image/webp", 0.8);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export function HeroSlideManager({ initialSlides }: { initialSlides: HeroSlide[] }) {
    const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // -- Create / Upload --
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading("جاري ضغط ورفع الصورة...");

        try {
            // 1. Compress
            const compressedBlob = await compressImage(file);
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

            // 2. Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('hero-images')
                .upload(fileName, compressedBlob, {
                    contentType: 'image/webp',
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw new Error(uploadError.message);

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage.from('hero-images').getPublicUrl(uploadData.path);

            // 4. Create DB Record
            const newSlide = {
                image_url: publicUrl,
                title: "",
                cta_link: "",
                is_active: true,
                display_order: slides.length
            };

            await createHeroSlide(newSlide);

            // 5. Optimistic UI update (refetch would be better in a real SSR mutation, but this keeps it fast)
            toast.success("تم رفع الصورة بنجاح وتحديث الكاش", { id: toastId });
            // Just refresh the page to get the true server state and avoid complex optimistic ID management
            window.location.reload();

        } catch (error: any) {
            console.error(error);
            toast.error(`فشل الرفع: ${error.message}`, { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // -- Delete --
    const handleDelete = async (id: string, imageUrl: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;

        try {
            await deleteHeroSlide(id, imageUrl);
            setSlides(slides.filter(s => s.id !== id));
            toast.success("تم حذف الإعلان");
        } catch (error: any) {
            toast.error(`خطأ أثناء الحذف: ${error.message}`);
        }
    };

    // -- Toggle Active --
    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateHeroSlide(id, { is_active: !currentStatus });
            setSlides(slides.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
            toast.success("تم تحديث حالة الإعلان");
        } catch (error: any) {
            toast.error(`خطأ: ${error.message}`);
        }
    };

    // -- Update Text fields (Debounced ideally, but direct save on blur for simplicity here) --
    const handleUpdateField = async (id: string, field: 'title' | 'cta_link', value: string) => {
        try {
            await updateHeroSlide(id, { [field]: value });
            setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
            toast.success("تم حفظ التعديلات");
        } catch (error: any) {
            toast.error(`خطأ: ${error.message}`);
        }
    };

    return (
        <div className="space-y-8 pb-32">
            {/* Upload Control */}
            <GlassCard className="p-8 flex flex-col items-center justify-center border-dashed border-2 border-white/20 hover:border-blue-500/50 transition-colors">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="hero-upload"
                />
                <label htmlFor="hero-upload" className="cursor-pointer flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white">إضافة إعلان جديد</h3>
                        <p className="text-white/40 text-sm mt-1">سيتم ضغط الصورة تلقائياً لتوفير المساحة</p>
                    </div>
                </label>
            </GlassCard>

            {/* Slides List */}
            <div className="space-y-4">
                {slides.map((slide, index) => (
                    <GlassCard key={slide.id} className={`p-4 flex flex-col md:flex-row gap-6 transition-opacity duration-300 ${!slide.is_active ? 'opacity-50' : ''}`}>

                        {/* Drag Handle & Preview */}
                        <div className="flex items-center gap-4">
                            <GripVertical className="text-white/20 cursor-grab active:cursor-grabbing w-6 h-6" />
                            <div className="relative w-48 h-28 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                <Image
                                    src={slide.image_url}
                                    alt={slide.title || 'Hero Slide'}
                                    fill
                                    className="object-cover"
                                    unoptimized // Storage URLs
                                />
                                {!slide.is_active && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                        <EyeOff className="text-white/60 w-8 h-8" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata Editor */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-white/40">العنوان (اختياري)</label>
                                <Input
                                    defaultValue={slide.title || ''}
                                    onBlur={(e) => handleUpdateField(slide.id, 'title', e.target.value)}
                                    icon={Type}
                                    placeholder="نص الإعلان..."
                                    className="bg-black/20 border-white/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-white/40">رابط التحويل CTA (اختياري)</label>
                                <Input
                                    defaultValue={slide.cta_link || ''}
                                    onBlur={(e) => handleUpdateField(slide.id, 'cta_link', e.target.value)}
                                    icon={Link2}
                                    placeholder="https://..."
                                    className="bg-black/20 border-white/5"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-r border-white/10 pt-4 md:pt-0 md:pr-4">
                            <SmartButton
                                onClick={() => handleToggleActive(slide.id, slide.is_active)}
                                className={`!w-12 !h-12 !p-0 ${slide.is_active ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' : 'border-white/20 text-white/60 hover:text-white'}`}
                            >
                                {slide.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </SmartButton>

                            <SmartButton
                                onClick={() => handleDelete(slide.id, slide.image_url)}
                                className="!w-12 !h-12 !p-0 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors bg-transparent"
                            >
                                <Trash2 className="w-5 h-5" />
                            </SmartButton>
                        </div>
                    </GlassCard>
                ))}

                {slides.length === 0 && (
                    <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-2xl">
                        لا توجد إعلانات حالياً
                    </div>
                )}
            </div>
        </div>
    );
}
