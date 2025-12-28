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
import { uploadFile } from "@/lib/storage";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Mock Data (Removed in favor of real component)
import { PendingPaymentsView } from "@/components/admin/PendingPaymentsView";


export default function AdminDashboard() {
    const { user, role, loading } = useAuth();
    const [activeTab, setActiveTab] = useState<'payments' | 'content' | 'devices'>('payments');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const router = useRouter();

    // --- SECURITY CHECK (CRITICAL) ---
    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    if (!user || (role !== 'admin')) {
        // Force redirect effect
        // In production effectively done by middleware too
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
        setUploadProgress(0);

        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const module = formData.get('module') as string;
        const videoId = formData.get('videoId') as string;
        const pdfFile = (formData.get('pdf') as File);
        const description = formData.get('description') as string;

        try {
            let pdfUrl = "";
            if (pdfFile && pdfFile.size > 0) {
                if (pdfFile.size > 5 * 1024 * 1024) throw new Error("حجم الملف يجب ألا يتجاوز 5 ميغابايت");

                pdfUrl = await uploadFile(pdfFile, `lessons/${module}/${Date.now()}_${pdfFile.name}`, (p) => setUploadProgress(p));
            }

            await addDoc(collection(db, "lessons"), {
                title,
                module,
                videoId,
                pdfUrl,
                description,
                createdAt: new Date()
            });

            toast.success("تم نشر الدرس بنجاح");
            (e.target as HTMLFormElement).reset();
            setUploadProgress(0);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "حدث خطأ أثناء الرفع");
        } finally {
            setIsLoading(false);
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
                            onClick={() => setActiveTab(tab.id as any)}
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
                                    <Input name="module" placeholder="الوحدة (folder name)" required />
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
                                        {isLoading ? `جاري الرفع ${Math.round(uploadProgress)}%` : "نشر الدرس"}
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

                            <div className="space-y-2">
                                <div className="bg-surface/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                                            SA
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">سعيد عدلي</h4>
                                            <p className="text-xs text-zinc-500">2 أجهزة نشطة</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleResetDevices("سعيد عدلي")}
                                        className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10"
                                    >
                                        تصفير الأجهزة
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}
