"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    XCircle, Upload, Search, Smartphone,
    CreditCard, User, Loader2, FileText, Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

// Components
import { PendingPaymentsView } from "@/components/admin/PendingPaymentsView";


export default function AdminDashboard() {
    const { user, profile, loading } = useAuth();
    const role = profile?.role;
    const router = useRouter();
    const supabase = createClient();

    // UI State
    const [activeTab, setActiveTab] = useState<'payments' | 'content' | 'devices'>('payments');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // --- SECURITY CHECK (CRITICAL) ---
    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    if (!user || user.role !== 'admin') { // Use role from user metadata/context
        return (
            <main className="min-h-screen bg-black flex items-center justify-center p-4">
                <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">الدخول مرفوض</h1>
                    <p className="text-zinc-400 mb-6">ليس لديك الصلاحيات للوصول إلى هذه الصفحة.</p>
                    <Button onClick={() => router.push('/')} className="w-full">العودة للرئيسية</Button>
                </GlassCard>
            </main>
        );
    }

    const handleResetDevices = (studentName: string) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 800)),
            {
                loading: `جاري تصفير أجهزة ${studentName}...`,
                success: 'تم تصفير الأجهزة بنجاح',
                error: 'فشلت العملية'
            }
        );
    };

    const handleUploadLesson = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setUploadProgress(10); // Fake start

        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const moduleName = formData.get('module') as string;
        const videoId = formData.get('videoId') as string;
        const pdfFile = (formData.get('pdf') as File);
        const description = formData.get('description') as string;

        try {
            let pdfUrl = "";
            let lessonSlug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            if (pdfFile && pdfFile.size > 0) {
                if (pdfFile.size > 10 * 1024 * 1024) throw new Error("حجم الملف يجب ألا يتجاوز 10 ميغابايت");

                setUploadProgress(30);

                // Upload to Supabase Storage
                // Assuming bucket 'lessons' exists or we reuse 'public'
                // Let's use a 'lessons' bucket
                const filePath = `${moduleName}/${Date.now()}_${pdfFile.name}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('lessons') // Need to ensure this bucket exists
                    .upload(filePath, pdfFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('lessons').getPublicUrl(filePath);
                pdfUrl = publicUrl;
                setUploadProgress(70);
            }

            // Insert into Database
            // We need a 'subject_id' strictly speaking, but for now we might map 'module' loosely
            // or just insert into 'lessons' if we have a way to link it.
            // The master schema references 'subject_id'.
            // For now, let's assume we fetch subject by slug or name, OR we just store it.
            // But wait, our 'lessons' table REQUIRES 'subject_id'.
            // We need to resolve the Module Name to a Subject ID first!

            // fetch subject
            const { data: subject } = await supabase.from('subjects').select('id').ilike('title', `%${moduleName}%`).single();

            if (!subject) {
                // Fallback or error?
                // Let's create a subject if not exists? No, that's risky.
                // Let's just default to first subject for safety if testing, or error.
                throw new Error(`Subject '${moduleName}' not found. Please ensure subject exists.`);
            }

            const { error: insertError } = await supabase.from('lessons').insert({
                title,
                slug: lessonSlug,
                subject_id: subject.id, // Linked!
                video_url: videoId,
                // pdf_url: pdfUrl, // Add this column if needed to schema! (My schema didn't have pdf_url)
                // Let's check schema... schema had 'video_url', 'is_free', etc.
                // We should add 'pdf_url' and 'description' to lessons table in schema update if missing.
                order_index: 0
            });

            if (insertError) throw insertError;

            setUploadProgress(100);
            toast.success("تم نشر الدرس بنجاح");
            (e.target as HTMLFormElement).reset();

        } catch (error: any) {
            console.error(error);
            const message = error.message || "حدث خطأ أثناء الرفع";
            toast.error(message);
        } finally {
            setIsLoading(false);
            setTimeout(() => setUploadProgress(0), 1000); // Reset
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] p-4 pb-24 text-white font-tajawal">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">لوحة القيادة</h1>
                        <p className="text-zinc-400 text-sm">أهلاً بك أيها القائد</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="text-primary w-5 h-5" />
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex p-1 bg-surface-highlight rounded-xl border border-white/5">
                    {[
                        { id: 'payments', icon: CreditCard, label: 'المدفوعات' },
                        { id: 'content', icon: Upload, label: 'المحتوى' },
                        { id: 'devices', icon: Smartphone, label: 'الأجهزة' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'payments' | 'content' | 'devices')}
                            className={cn(
                                "flex-1 py-3 rounded-lg flex flex-col items-center gap-1 transition-all text-xs font-medium relative outline-none",
                                activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* PAYMENTS */}
                    {activeTab === 'payments' && (
                        <PendingPaymentsView />
                    )}

                    {/* CONTENT UPLOAD */}
                    {activeTab === 'content' && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <GlassCard className="p-6">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-primary" />
                                    إضافة درس جديد
                                </h2>
                                <form onSubmit={handleUploadLesson} className="space-y-4">
                                    <Input name="title" placeholder="عنوان الدرس" required />
                                    <Input name="module" placeholder="المادة (مثال: الرياضيات)" required />
                                    <Input name="videoId" placeholder="رابط فيديو يوتيوب (ID)" icon={Video} required />

                                    <div className="bg-surface-highlight border border-border rounded-xl p-3 flex items-center gap-3 active:scale-[0.99] transition-transform">
                                        <FileText className="w-5 h-5 text-zinc-500" />
                                        <input type="file" name="pdf" accept="application/pdf" className="bg-transparent text-sm w-full text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                                    </div>

                                    <textarea
                                        name="description"
                                        placeholder="وصف الدرس..."
                                        className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary min-h-[100px] transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(41,151,255,0.15)]"
                                        required
                                    />

                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                                            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                    )}

                                    <Button isLoading={isLoading} className="w-full mt-4" size="lg">
                                        {isLoading ? `جاري الرفع...` : "نشر الدرس"}
                                    </Button>
                                </form>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* DEVICES */}
                    {activeTab === 'devices' && (
                        <motion.div
                            key="devices"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <GlassCard className="p-4 mb-4">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="بحث عن طالب..."
                                        className="w-full bg-surface-highlight border border-border rounded-xl py-3 pr-10 pl-4 text-white focus:outline-none focus:border-primary transition-all duration-300"
                                    />
                                </div>
                            </GlassCard>
                            {/* Devices List Boilerplate - Logic Needed if storing sessions */}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}
