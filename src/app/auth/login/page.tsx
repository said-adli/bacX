"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard"; // Assuming GlassCard is available and appropriate
import { BrainyStoneLogoSVG } from "@/components/ui/BrainyStoneLogoSVG";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
    const { loginWithEmail, loginWithGoogle, loading, error } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginWithEmail(email, password);
            toast.success("تم تسجيل الدخول بنجاح");
        } catch (err) {
            console.error(err);
            toast.error("فشل تسجيل الدخول: تأكد من البيانات");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            // Toast handled by effect or navigation, strictly speaking
        } catch (err) {
            console.error(err);
            toast.error("فشل تسجيل الدخول عبر جوجل");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements if needed, or rely on global layout */}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24">
                        <BrainyStoneLogoSVG />
                    </div>
                </div>

                <GlassCard className="p-8 border-white/10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 font-amiri mb-2">
                            تسجيل الدخول
                        </h1>
                        <p className="text-text-muted">مرحباً بك مجدداً في بوابة النخبة</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="البريد الإلكتروني"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={Mail}
                                required
                                className="bg-black/20 border-white/10 focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="كلمة المرور"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={Lock}
                                required
                                className="bg-black/20 border-white/10 focus:border-primary/50"
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold h-12 shadow-lg shadow-blue-600/20"
                                isLoading={loading}
                            >
                                {loading ? "جاري الدخول..." : "دخول"}
                            </Button>
                        </div>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-text-muted text-sm">أو</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full border-white/10 hover:bg-white/5"
                        onClick={handleGoogleLogin}
                        isLoading={loading}
                        type="button"
                    >
                        <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        المتابعة باستخدام Google
                    </Button>

                    <div className="mt-6 text-center">
                        <p className="text-text-muted text-sm">
                            ليس لديك حساب؟{" "}
                            <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                إنشاء حساب جديد
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
