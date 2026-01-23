"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Since we don't have a Dialog component yet, I'll build a custom Modal here or use a quick portal.
// For Simplicity in this "One Shot", I will create a focused Modal overlay.

interface ReauthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReauthModal({ isOpen, onClose, onSuccess }: ReauthModalProps) {
    const { user } = useAuth(); // We need email from here
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient(); // Use client component client

    const handleReauth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.email) return;

        setLoading(true);
        try {
            // REAL RE-AUTH: Verify password by attempting a fresh sign-in
            // We verify credentials without persisting the new session (or we just accept it refreshes)
            const { error } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: password
            });

            if (error) {
                throw error;
            }

            // If successful, we proved user knows password.
            toast.success("تم تأكيد الهوية بنجاح");
            onSuccess();
            onClose();
        } catch (error: any) {
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md"
                    >
                        <GlassCard className="p-8 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                            <button onClick={onClose} className="absolute left-4 top-4 text-zinc-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col items-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500 border border-red-500/20">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-white font-tajawal">تأكيد أمني مطلوب</h2>
                                <p className="text-zinc-400 text-center mt-3 font-tajawal leading-relaxed">
                                    هذا إجراء حساس. يرجى إعادة إدخال كلمة المرور للمتابعة.
                                </p>
                            </div>

                            <form onSubmit={handleReauth} className="space-y-6">
                                <Input
                                    type="password"
                                    placeholder="كلمة المرور الحالية"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-black/40 border-white/10 h-12 text-lg"
                                    autoFocus
                                />
                                <Button
                                    isLoading={loading}
                                    className="w-full h-12 text-lg font-bold bg-red-600 hover:bg-red-700 text-white"
                                    size="lg"
                                >
                                    تأكيد الهوية
                                </Button>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
