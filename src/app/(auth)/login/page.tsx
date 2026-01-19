"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainyStoneLogoSVG } from "@/components/ui/BrainyStoneLogoSVG";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const { loginWithEmail, error } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginWithEmail(email, password);
            toast.success("تم تسجيل الدخول بنجاح");
            setTimeout(() => {
                router.push("/dashboard");
            }, 500);
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "فشل تسجيل الدخول";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {/* Breathing Logo */}
            <div className="flex flex-col items-center justify-center mb-8 gap-4">
                <motion.div
                    className="w-[90px] h-[90px] relative"
                    animate={{
                        filter: ["drop-shadow(0 0 10px rgba(59,130,246,0.2))", "drop-shadow(0 0 25px rgba(59,130,246,0.6))", "drop-shadow(0 0 10px rgba(59,130,246,0.2))"]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Image
                        src="/images/brainy-logo-v3.png"
                        alt="Brainy Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent tracking-widest uppercase font-serif"
                    style={{ textShadow: '0 0 25px rgba(37,99,235,0.5)' }}
                >
                    Brainy
                </motion.h1>
            </div>

            <GlassCard className="p-8 border-white/10 bg-white/5 backdrop-blur-[40px] shadow-[0_0_50px_rgba(37,99,235,0.1)] rounded-[2rem]">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white/60 bg-clip-text text-transparent">مرحباً بك مجدداً</h1>
                    <p className="text-white/40 text-sm mt-2">سجل دخولك للمتابعة في رحلتك التعليمية</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-red-500/10 border border-red-500/10 rounded-xl p-3 mb-6 flex items-center gap-3 text-red-300 text-xs"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Input
                                type="email"
                                placeholder="البريد الإلكتروني"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={Mail}
                                required
                                className="bg-white/5 border-white/10 focus:border-blue-400/50 focus:bg-white/10 text-white placeholder:text-white/20 h-14 text-right pr-4 rounded-xl transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                dir="rtl"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <Input
                                    type="password"
                                    placeholder="كلمة المرور"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon={Lock}
                                    required
                                    className="bg-white/5 border-white/10 focus:border-blue-400/50 focus:bg-white/10 text-white placeholder:text-white/20 h-14 text-right pr-4 rounded-xl transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                    dir="rtl"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-[11px] text-white/30 hover:text-white/80 transition-colors">
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
                            size="lg"
                            isLoading={loading}
                        >
                            {loading ? "..." : "دخول"}
                        </Button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-4">
                    <div className="text-xs text-white/30">
                        لا تمتلك حساباً؟{" "}
                        <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                            أنشئ حساب جديد
                        </Link>
                    </div>

                    <Link href="/" className="text-white/10 hover:text-white/30 text-[10px] transition-colors flex items-center justify-center gap-1 group">
                        <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                        العودة للرئيسية
                    </Link>
                </div>
            </GlassCard>
        </motion.div>
    );
}
