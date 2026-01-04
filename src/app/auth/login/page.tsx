"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainyStoneLogoSVG } from "@/components/ui/BrainyStoneLogoSVG";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
    const { loginWithEmail, loading, error } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginWithEmail(email, password);
            toast.success("تم تسجيل الدخول بنجاح");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل تسجيل الدخول");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
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
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold h-12 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                                size="lg"
                                isLoading={loading}
                            >
                                {loading ? "جاري الدخول..." : "دخول"}
                            </Button>
                        </div>
                    </form>

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
