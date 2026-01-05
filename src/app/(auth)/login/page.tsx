"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainyStoneLogoSVG } from "@/components/ui/BrainyStoneLogoSVG";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
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
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "فشل تسجيل الدخول";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#050505] text-white font-tajawal">

            {/* Ambient Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/5 blur-[150px] rounded-full opacity-40 mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-900/5 blur-[150px] rounded-full opacity-40 mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Breathing Logo */}
                <div className="flex justify-center mb-10">
                    <motion.div
                        className="w-20 h-20 relative"
                        animate={{
                            filter: ["drop-shadow(0 0 0px rgba(59,130,246,0))", "drop-shadow(0 0 15px rgba(59,130,246,0.3))", "drop-shadow(0 0 0px rgba(59,130,246,0))"]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <BrainyStoneLogoSVG />
                    </motion.div>
                </div>

                <GlassCard className="p-8 border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/50">

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/10 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-400 text-xs"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Input
                                    type="email"
                                    placeholder="البريد الإلكتروني"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon={Mail}
                                    required
                                    className="bg-black/40 border-white/5 focus:border-white/20 text-white placeholder:text-white/20 h-12 text-sm transition-all group-hover:bg-black/50"
                                />
                            </div>
                            <div className="relative group">
                                <Input
                                    type="password"
                                    placeholder="كلمة المرور"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon={Lock}
                                    required
                                    className="bg-black/40 border-white/5 focus:border-white/20 text-white placeholder:text-white/20 h-12 text-sm transition-all group-hover:bg-black/50"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 shadow-lg shadow-white/5 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm tracking-wide"
                                size="lg"
                                isLoading={loading}
                            >
                                {loading ? "..." : "دخول"}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center flex flex-col gap-3">
                        <Link href="/auth/signup" className="text-white/30 hover:text-white text-xs transition-colors duration-300">
                            إنشاء حساب جديد
                        </Link>
                        <Link href="/" className="text-white/10 hover:text-white/30 text-[10px] transition-colors flex items-center justify-center gap-1 group">
                            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                            العودة للرئيسية
                        </Link>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
