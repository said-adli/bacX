"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Copy, Check, UploadCloud, ChevronRight, CreditCard, ShieldCheck, AlertTriangle, Tag, Lock, Youtube } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getContentDetails } from "@/actions/checkout";
import { Loader2 } from "lucide-react";

export default function ContentCheckoutPage({ params }: { params: { type: string, id: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const { type, id } = params;

    // States
    const [uploading, setUploading] = useState(false);
    const [content, setContent] = useState<{ id: string; title: string; price: number } | null>(null);
    const [loadingContent, setLoadingContent] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; finalPrice: number } | null>(null);

    const handleApplyCoupon = async () => {
        if (!couponCode || !content) return;
        setValidatingCoupon(true);
        try {
            const { validateCoupon } = await import("@/actions/coupons");
            const result = await validateCoupon(couponCode, content.price);

            if (result.valid) {
                setAppliedCoupon({
                    code: couponCode,
                    discountAmount: result.discountAmount,
                    finalPrice: result.finalPrice
                });
                toast.success(result.message);
            } else {
                toast.error(result.message || "الكود غير صالح");
                setAppliedCoupon(null);
            }
        } catch (e) {
            toast.error("حدث خطأ أثناء التحقق");
        } finally {
            setValidatingCoupon(false);
        }
    };

    // Fetch Content on Mount
    useEffect(() => {
        async function fetchContent() {
            setLoadingContent(true);
            if (type !== 'lesson' && type !== 'subject') {
                setError("Invalid content type");
                setLoadingContent(false);
                return;
            }

            const { success, content, error } = await getContentDetails(type as 'lesson' | 'subject', id);

            if (success && content) {
                if (!content.is_purchasable || !content.price) {
                    setError("This content is not available for individual purchase.");
                } else {
                    setContent({ ...content, price: content.price });
                }
            } else {
                setError(error || "Content not found");
            }
            setLoadingContent(false);
        }

        if (id) {
            fetchContent();
        }
    }, [id, type]);

    const CCP_INFO = {
        name: "منصة برايني للتعليم",
        ccp: "0025489632 55",
        key: "55",
        bank: "Banque d'Algérie"
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("تم النسخ بنجاح");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !content) return;

        setUploading(true);
        const toastId = toast.loading("جاري رفع الوصل وتأكيد الطلب...");

        try {
            // 1. Upload File
            const fileName = `receipts/${user.id}-${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Create Payment Request (Secure Action)
            const { createPaymentRequest } = await import("@/actions/payment");
            const { success, error } = await createPaymentRequest({
                userId: user.id,
                contentId: content.id,
                contentType: type as 'lesson' | 'subject',
                receiptUrl: fileName,
                couponCode: couponCode || undefined
            });

            if (!success) throw new Error(error || "Failed to create request");

            toast.success("تم إرسال طلبك بنجاح! سيتم تفعيل الدرس قريباً", { id: toastId });
            setTimeout(() => router.push('/materials'), 2000);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            console.error(err);
            toast.error("حدث خطأ أثناء الرفع: " + errorMessage, { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    if (loadingContent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-white w-8 h-8" />
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
                <AlertTriangle className="text-red-500 w-12 h-12" />
                <h1 className="text-2xl font-bold text-white">عذراً، المحتوى غير متاح للشراء</h1>
                <p className="text-white/50">{error}</p>
                <button
                    onClick={() => router.push('/materials')}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                    العودة للمواد
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 pt-10 px-4">

            {/* Header */}
            <div className="flex items-center gap-2 text-white/50 mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => router.back()}>
                <ChevronRight size={16} />
                <span>العودة</span>
            </div>

            <div className="flex flex-col md:flex-row gap-8">

                {/* LEFT: Payment Info & Steps */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-white mb-2">شراء {type === 'lesson' ? 'درس' : 'مادة'}</h1>
                        <p className="text-white/60">امتلاك مدى الحياة لهذا المحتوى.</p>
                    </div>

                    {/* Security Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
                        <ShieldCheck size={12} />
                        <span>دفع آمن ومحمي 100%</span>
                    </div>

                    {/* Step 1: Payment Info */}
                    <GlassCard className="p-6 border-blue-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                                <CreditCard size={20} />
                            </div>
                            <h3 className="font-bold text-white text-lg">1. معلومات الدفع (CCP)</h3>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 p-6 rounded-2xl text-black space-y-4 shadow-lg relative overflow-hidden">
                            {/* CCP Logo Watermark effect */}
                            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                                <Image src="/images/algerie-poste-logo.png" width={150} height={150} alt="Algérie Poste" />
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-yellow-800/60 uppercase tracking-widest mb-1">اسم الحساب</p>
                                    <p className="font-bold text-xl">{CCP_INFO.name}</p>
                                </div>
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Alg%C3%A9rie_Poste.svg/2560px-Alg%C3%A9rie_Poste.svg.png" width={40} height={40} alt="CCP" className="opacity-80" />
                            </div>

                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="group cursor-pointer" onClick={() => copyToClipboard(CCP_INFO.ccp)}>
                                    <p className="text-xs font-bold text-yellow-800/60 uppercase tracking-widest mb-1">رقم الحساب (CCP)</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-2xl font-bold tracking-wider">{CCP_INFO.ccp}</p>
                                        <Copy size={14} className="opacity-0 group-hover:opacity-50" />
                                    </div>
                                </div>
                                <div className="group cursor-pointer" onClick={() => copyToClipboard(CCP_INFO.key)}>
                                    <p className="text-xs font-bold text-yellow-800/60 uppercase tracking-widest mb-1">المفتاح (Clé)</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-2xl font-bold">{CCP_INFO.key}</p>
                                        <Copy size={14} className="opacity-0 group-hover:opacity-50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Step 2: Upload */}
                    <GlassCard className="p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                    <UploadCloud size={20} />
                                </div>
                                <h3 className="font-bold text-white text-lg">2. إرسال وصل الدفع</h3>
                            </div>

                            <p className="text-sm text-white/60 mb-6">
                                بعد إجراء عملية الدفع في البريد أو عبر تطبيق BaridiMob، قم بتصوير الوصل ورفعه هنا.
                            </p>

                            <label className={`block w-full border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-blue-500/50 hover:bg-blue-500/5 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                        {uploading ? (
                                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <UploadCloud size={32} className="text-blue-400" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-white">اضغط لرفع الصورة</h4>
                                    <p className="text-xs text-white/40">PNG, JPG up to 5MB</p>
                                </div>
                            </label>
                        </div>
                    </GlassCard>

                </div>

                {/* RIGHT: Order Summary */}
                <div className="w-full md:w-96">
                    <GlassCard className="p-6 sticky top-8 border-white/10">
                        <h3 className="font-bold text-white mb-6 text-lg">ملخص الطلب</h3>

                        <div className="space-y-4 mb-6 pb-6 border-b border-white/5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60">المحتوى</span>
                                <span className="font-bold text-white text-right w-1/2 truncate">{content.title}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60">النوع</span>
                                <span className="font-bold text-blue-400">{type === 'lesson' ? 'درس (فيديو)' : 'مادة كاملة'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60">المدة</span>
                                <span className="font-bold text-green-400">مدى الحياة</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-lg text-white">المجموع</span>
                            <span className="font-bold text-2xl text-blue-400">
                                {appliedCoupon ? appliedCoupon.finalPrice : content.price} دج
                            </span>
                        </div>

                        <div className="p-3 mb-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 leading-relaxed">
                            هذا شراء لمرة واحدة. ستتمكن من الوصول لهذا المحتوى للأبد بمجرد تفعيل الدفع.
                        </div>

                        {/* COUPON SECTION */}
                        <div className="flex gap-2">
                            <input
                                disabled={!!appliedCoupon}
                                placeholder="كود الخصم (اختياري)"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            />
                            {appliedCoupon ? (
                                <button
                                    onClick={() => {
                                        setAppliedCoupon(null);
                                        setCouponCode("");
                                    }}
                                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors"
                                >
                                    إلغاء
                                </button>
                            ) : (
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={validatingCoupon || !couponCode}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                >
                                    {validatingCoupon && <Loader2 className="w-3 h-3 animate-spin" />}
                                    تطبيق
                                </button>
                            )}
                        </div>

                        {appliedCoupon && (
                            <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs flex justify-between items-center text-green-400 animate-in fade-in slide-in-from-top-1">
                                <span>تم تطبيق الخصم بنجاح!</span>
                                <span className="font-bold font-mono">-{appliedCoupon.discountAmount} DA</span>
                            </div>
                        )}
                    </GlassCard>
                </div>

            </div>
        </div>
    );
}
