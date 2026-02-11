"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2, Trash2 } from "lucide-react";
import { deleteAccount } from "@/actions/account";
import { useRouter } from "next/navigation";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const userEmail = user?.email || "";
    const isConfirmed = confirmText.toLowerCase() === userEmail.toLowerCase();

    const handleDelete = async () => {
        if (!isConfirmed) return;

        setIsDeleting(true);
        try {
            const result = await deleteAccount();

            if (!result.success) {
                throw new Error(result.error || "فشل حذف الحساب");
            }

            toast.success("تم حذف الحساب بنجاح", {
                description: "سيتم تحويلك للصفحة الرئيسية..."
            });

            // Brief delay to show success toast before redirect
            setTimeout(() => {
                router.replace("/");
                router.refresh();
            }, 1500);
        } catch (error) {
            console.error("Account deletion error:", error);
            toast.error("فشل حذف الحساب", {
                description: error instanceof Error ? error.message : "حدث خطأ غير متوقع"
            });
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (isDeleting) return; // Prevent closing during deletion
        setConfirmText("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md"
                    >
                        <GlassCard className="p-8 border-red-500/30 shadow-[0_0_60px_rgba(220,38,38,0.25)]">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                disabled={isDeleting}
                                className="absolute left-4 top-4 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Danger Header */}
                            <div className="flex flex-col items-center mb-6">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                    className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/30"
                                >
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-white font-tajawal">حذف الحساب نهائياً</h2>
                                <p className="text-zinc-400 text-center mt-3 font-tajawal leading-relaxed text-sm">
                                    هذا الإجراء <span className="text-red-400 font-bold">لا يمكن التراجع عنه</span>. سيتم حذف جميع بياناتك، بما في ذلك الملف الشخصي والاشتراكات والتقدم.
                                </p>
                            </div>

                            {/* Danger Zone Border */}
                            <div className="border border-red-500/20 rounded-xl p-4 mb-6 bg-red-500/5">
                                <p className="text-sm text-white/60 mb-3 font-tajawal">
                                    للتأكيد، اكتب بريدك الإلكتروني: <span className="text-red-400 font-mono text-xs break-all">{userEmail}</span>
                                </p>
                                <input
                                    type="email"
                                    dir="ltr"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="أدخل بريدك الإلكتروني للتأكيد"
                                    disabled={isDeleting}
                                    className="w-full bg-black/40 border border-red-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-white/30 disabled:opacity-50 font-mono"
                                    autoFocus
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all font-bold text-sm disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!isConfirmed || isDeleting}
                                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isConfirmed && !isDeleting
                                            ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                                            : "bg-red-600/20 text-red-400/50 cursor-not-allowed"
                                        }`}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            جاري الحذف...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            حذف الحساب
                                        </>
                                    )}
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
