"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

import { submitPayment } from "@/lib/payment-service";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Upload, CreditCard, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { compressImage } from "@/lib/compression";
import { validateFile } from "@/lib/file-validation";
import { uploadFile as uploadFileToStorage } from "@/lib/storage";

export default function SubscriptionPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const CCP_NUMBER = "00246589 55";
    const CLE = "45";
    const HOLDER = "Said Adli";

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("تم النسخ بنجاح");
    };

    const handleUpload = async () => {
        if (!user || !file) return;
        setLoading(true);

        try {
            // 1. Validate File (Size + Magic Bytes)
            const validation = await validateFile(file);
            if (!validation.valid) {
                toast.error(validation.error || "Invalid file.");
                setLoading(false);
                return;
            }

            // 2. Compress Image (if image)
            toast.message("جاري ضغط الصورة لتقليل الحجم...");
            let uploadFile = file;
            if (file.type.startsWith('image/')) {
                uploadFile = await compressImage(file);
            }

            // 3. Upload Image
            const url = await uploadFileToStorage(uploadFile, `receipts/${user.uid}_${Date.now()}`, () => { });

            // 3. Submit Request
            await submitPayment({
                userId: user.uid,
                userName: user.displayName || user.email || "Unknown",
                receiptUrl: url,
                amount: "4500 DA",
                plan: "yearly",
                status: 'pending'
            });

            toast.success("تم إرسال الوصل بنجاح! سيتم تفعيل حسابك قريباً.");
        } catch (error) {
            console.error(error);
            toast.error("فشل في رفع الوصل. حاول مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] p-6 flex flex-col items-center justify-center font-tajawal text-white">
            <h1 className="text-3xl font-bold mb-2">اختر باقتك الدراسية</h1>
            <p className="text-zinc-400 mb-8">استثمر في مستقبلك مع أفضل الدروس والمراجعات</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Plan Card */}
                <GlassCard className="p-8 border-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                        BEST VALUE
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">الباقة الذهبية (Yearly)</h3>
                    <div className="text-4xl font-bold text-primary mb-4">4500 DA <span className="text-lg text-zinc-500 font-normal">/ سنة</span></div>

                    <ul className="space-y-3 mb-8 text-zinc-300 text-sm">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> جميع الدروس (فيديو 4K)
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> البث المباشر (Live)
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> تمارين ومقترحات حصرية
                        </li>
                    </ul>
                </GlassCard>

                {/* Upload Section */}
                <GlassCard className="p-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        طريقة الدفع (CCP / BaridiMob)
                    </h3>

                    <div className="bg-white/5 rounded-lg p-4 space-y-3 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-400 text-sm">Account Holder</span>
                            <span className="font-mono">{HOLDER}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-400 text-sm">CCP</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-lg text-primary">{CCP_NUMBER}</span>
                                <Copy className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-white" onClick={() => handleCopy(CCP_NUMBER)} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-400 text-sm">Clé</span>
                            <span className="font-mono">{CLE}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm text-zinc-400">تحميل وصل الدفع (صورة واضحة)</label>
                        <div className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 transition-colors p-8 flex flex-col items-center justify-center text-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <div className="text-primary font-medium">{file.name}</div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-zinc-500 mb-2 group-hover:text-primary transition-colors" />
                                    <span className="text-xs text-zinc-400">انقر للرفع أو اسحب الصورة هنا</span>
                                </>
                            )}
                        </div>

                        <Button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "إرسال الوصل للتفعيل"}
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
