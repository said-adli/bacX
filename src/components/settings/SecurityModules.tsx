"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog"; // Will need to quickly mock a Dialog or use a simple modal overlay
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

// Since we don't have a Dialog component yet, I'll build a custom Modal here or use a quick portal.
// For Simplicity in this "One Shot", I will create a focused Modal overlay.

interface ReauthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReauthModal({ isOpen, onClose, onSuccess }: ReauthModalProps) {
    const { user } = useAuth();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReauth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.email) return;

        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);
            toast.success("تم تأكيد الهوية بنجاح");
            onSuccess();
            onClose();
        } catch (error: unknown) {
            console.error(error);
            toast.error("كلمة المرور غير صحيحة", {
                description: "يرجى المحاولة مرة أخرى لتأكيد هويتك."
            });
        } finally {
            setLoading(false);
            setPassword("");
        }
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
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md"
                    >
                        <GlassCard className="p-6 border-primary/20 shadow-[0_0_50px_rgba(41,151,255,0.1)]">
                            <button onClick={onClose} className="absolute left-4 top-4 text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center mb-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-white font-tajawal">تأكيد الهوية</h2>
                                <p className="text-sm text-zinc-400 text-center mt-2 max-w-[80%] font-tajawal">
                                    لأغراض أمنية، يرجى إدخال كلمة المرور الحالية للمتابعة.
                                </p>
                            </div>

                            <form onSubmit={handleReauth} className="space-y-4">
                                <Input
                                    type="password"
                                    placeholder="كلمة المرور"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-black/40 border-white/10"
                                    autoFocus
                                />
                                <Button
                                    isLoading={loading}
                                    className="w-full"
                                    size="lg"
                                >
                                    تأكيد
                                </Button>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
