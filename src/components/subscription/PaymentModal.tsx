"use client";

import { useState } from "react";
import { Copy, Upload, X, Loader2, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PAYMENT_METHODS } from "@/lib/payment";

interface PaymentModalProps {
    planName: string;
    price: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (file: File) => Promise<void>;
}

export function PaymentModal({ planName, price, isOpen, onClose, onSubmit }: PaymentModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;
        setIsSubmitting(true);
        await onSubmit(selectedFile);
        setIsSubmitting(false);
        setIsSuccess(true);
        // Auto close or let user close
        setTimeout(() => {
            onClose();
            setIsSuccess(false);
            setSelectedFile(null);
            setPreviewUrl(null);
        }, 2000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could expand to show a toast here
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <GlassCard className="relative w-full max-w-lg p-0 overflow-hidden animate-in fade-in zoom-in duration-300 border-white/10 shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h3 className="text-xl font-bold text-white">تأكيد الاشتراك - باقة {planName}</h3>
                        <p className="text-sm text-white/50">قم بتحويل مبلغ <span className="text-blue-400 font-bold">{price}</span> لتفعيل حسابك</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-white/70" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* CCP Details */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-white/70">معلومات الدفع (CCP/BaridiMob)</label>
                        <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20 space-y-3 relative group">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/50">الاسم الكامل</span>
                                <span className="font-mono font-bold">{PAYMENT_METHODS.CCP.name}</span>
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/50">رقم الحساب (CCP)</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-blue-300">{PAYMENT_METHODS.CCP.account}</span>
                                    <button onClick={() => copyToClipboard(PAYMENT_METHODS.CCP.account)} className="p-1 hover:text-white text-white/40 transition-colors">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/50">المفتاح (Clé)</span>
                                <span className="font-mono font-bold">{PAYMENT_METHODS.CCP.key}</span>
                            </div>
                        </div>
                    </div>

                    {/* Upload Zone */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-white/70">إرفاق وصل الدفع</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${selectedFile ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5'}`}>
                                {previewUrl ? (
                                    <div className="relative w-full h-32 flex items-center justify-center">
                                        <img src={previewUrl} alt="Receipt" className="h-full object-contain rounded-lg shadow-lg" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-white text-sm font-bold">تغيير الصورة</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-white/50">
                                            <Upload size={24} />
                                        </div>
                                        <p className="text-sm font-medium text-white/80">اضغط لرفع صورة الوصل</p>
                                        <p className="text-xs text-white/40 mt-1">JPG, PNG أو PDF</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedFile || isSubmitting || isSuccess}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                            ${isSuccess
                                ? "bg-green-600 text-white"
                                : isSubmitting
                                    ? "bg-blue-600/50 cursor-wait"
                                    : !selectedFile
                                        ? "bg-white/5 text-white/30 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                            }
                        `}
                    >
                        {isSuccess ? (
                            <>
                                <CheckCircle size={20} />
                                تم الإرسال بنجاح
                            </>
                        ) : isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                جاري الإرسال...
                            </>
                        ) : (
                            "تأكيد وإرسال"
                        )}
                    </button>

                </div>
            </GlassCard>
        </div>
    );
}
