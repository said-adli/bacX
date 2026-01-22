"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
                router.refresh();
                router.push("/dashboard");
            }, 600); // Slightly longer for effect
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "فشل تسجيل الدخول";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full bg-mesh-dynamic flex items-center justify-center p-4 relative overflow-hidden">

            {/* Ambient Lighting Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '6s' }} />
            </div>

            {/* Split Screen Layout */}
            <div className="w-full min-h-screen flex flex-col lg:flex-row relative z-10">

                {/* LEFT COLUMN - Brand Experience (Desktop Only) */}
                <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden">
                    {/* Floating Abstract Element */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                        <div className="w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }} />
                        <div className="w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }} />
                    </motion.div>

                    {/* Logo & Tagline */}
                    <div className="relative z-10 text-center space-y-8">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="relative w-64 h-64 mx-auto"
                        >
                            <Image
                                src="/images/brainy-logo-black.png"
                                alt="Brainy Large Logo"
                                fill
                                className="object-contain"
                                style={{ filter: 'invert(1) brightness(1.5) drop-shadow(0 0 20px rgba(59,130,246,0.5))' }}
                                priority
                            />
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white/80 font-serif tracking-tight drop-shadow-lg">
                                Brainy
                            </h1>
                            <p className="mt-6 text-2xl text-blue-100/90 font-light leading-relaxed max-w-lg mx-auto" dir="rtl">
                                بوابتك نحو التميز الأكاديمي
                                <br />
                                <span className="text-lg text-white/50 block mt-2">رحلة التفوق تبدأ من هنا</span>
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* RIGHT COLUMN - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Apple-esque spring
                        className="w-full max-w-md lg:max-w-[480px] relative z-10"
                    >
                        <div className="glass-login rounded-[2.5rem] p-8 md:p-10 border border-white/10 relative overflow-hidden">
                            {/* Inner Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

                            {/* Logo Section (Mobile Only now or smaller on desktop if desired) */}
                            <div className="flex flex-col items-center justify-center mb-10 gap-5 relative z-10 lg:hidden">
                                <motion.div
                                    className="w-24 h-24 relative"
                                    animate={{
                                        y: [0, -5, 0],
                                        filter: ["drop-shadow(0 0 15px rgba(59,130,246,0.3))", "drop-shadow(0 0 30px rgba(59,130,246,0.6))", "drop-shadow(0 0 15px rgba(59,130,246,0.3))"]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Image
                                        src="/images/brainy-logo-black.png"
                                        alt="Brainy Logo"
                                        fill
                                        className="object-contain" // Preserves transparency
                                        style={{ filter: 'invert(1) brightness(2) drop-shadow(0 0 2px white)' }} // Pure white metallic feel
                                        priority
                                    />
                                </motion.div>
                                <motion.h1
                                    className="text-5xl font-bold text-metallic tracking-wider uppercase font-serif"
                                >
                                    Brainy
                                </motion.h1>
                            </div>

                            {/* Desktop Heading (Simple) */}
                            <div className="hidden lg:block text-center mb-10 relative z-10">
                                <h2 className="text-3xl font-bold text-white mb-2">تسجيل الدخول</h2>
                                <p className="text-white/50 text-sm">أهلاً بك في منصة المتفوقين</p>
                            </div>

                            {/* Header Text (Mobile) */}
                            <div className="text-center mb-8 relative z-10 lg:hidden">
                                <h2 className="text-xl font-medium text-white/90">مرحباً بك مجدداً</h2>
                                <p className="text-white/40 text-sm mt-3 font-light">بوابتك نحو التميز الأكاديمي</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-300 text-sm backdrop-blur-sm"
                                >
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Input
                                            type="email"
                                            placeholder="البريد الإلكتروني"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            icon={Mail}
                                            required
                                            className="input-premium h-14 text-right pr-4 rounded-2xl text-white placeholder:text-white/30"
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
                                                className="input-premium h-14 text-right pr-4 rounded-2xl text-white placeholder:text-white/30"
                                                dir="rtl"
                                            />
                                        </div>
                                        <div className="flex justify-end px-1">
                                            <Link href="/forgot-password" className="text-xs text-blue-300/80 hover:text-white hover:underline transition-all">
                                                نسيت كلمة المرور؟
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold h-14 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-lg border border-white/20"
                                        size="lg"
                                        isLoading={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>جاري الدخول...</span>
                                            </div>
                                        ) : "تسجيل الدخول"}
                                    </Button>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-white/10 text-center flex flex-col gap-5 relative z-10">
                                <div className="text-sm text-white/40">
                                    لا تمتلك حساباً؟{" "}
                                    <Link href="/auth/signup" className="text-blue-400 hover:text-white font-bold transition-colors ml-1">
                                        أنشئ حساب جديد
                                    </Link>
                                </div>

                                <Link href="/" className="text-white/20 hover:text-white/50 text-xs transition-colors flex items-center justify-center gap-2 group mt-2">
                                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                    العودة للرئيسية
                                </Link>
                            </div>
                        </div>

                        {/* Bottom Shadow for grounding */}
                        <div className="absolute -bottom-10 left-10 right-10 h-10 bg-black/50 blur-[30px] rounded-[50%]" />
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
