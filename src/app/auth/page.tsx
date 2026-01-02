"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SignUp } from "@/components/auth/SignUp";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import { cn } from "@/lib/utils";

// Separate component to use useSearchParams safely
function AuthContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'signup') {
            setIsLogin(false);
        } else if (mode === 'login') {
            setIsLogin(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!loading && user) {
            router.replace("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) return null; // Or a loading spinner

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("تم تسجيل الدخول بنجاح");
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error("فشل تسجيل الدخول: تأكد من البيانات");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-[#050505] overflow-hidden selection:bg-primary/30 text-foreground font-sans">

            {/* LEFT PANEL - BRANDING (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative bg-[#020617] items-center justify-center p-12 overflow-hidden border-l border-white/5">
                <NeuralBackground />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />

                <div className="relative z-10 max-w-lg text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8 flex justify-center"
                    >
                        <Logo className="scale-150" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl font-serif font-bold text-white mb-6 leading-tight"
                    >
                        Master Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Baccalaureate</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-lg text-slate-400 leading-relaxed"
                    >
                        انضم إلى الآلاف من الطلاب المتفوقين. منصة شاملة، دروس تفاعلية، ومتابعة ذكية لتضمن نجاحك.
                    </motion.p>
                </div>

                {/* Decorative floating elements */}
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-600/20 blur-[60px] rounded-full" />
                <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-600/20 blur-[80px] rounded-full" />
            </div>

            {/* RIGHT PANEL - FORM */}
            <div className="w-full lg:w-1/2 relative flex flex-col justify-center p-6 sm:p-12 lg:p-24 overflow-y-auto">
                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-6 left-6">
                    <Logo />
                </div>

                <div className="w-full max-w-md mx-auto relative z-10">
                    <motion.div
                        key={isLogin ? "login-header" : "signup-header"}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-10"
                    >
                        <h2 className="text-3xl font-bold text-white mb-2 font-serif">
                            {isLogin ? "مرحباً بعودتك" : "أنشئ حسابك الجديد"}
                        </h2>
                        <p className="text-slate-400">
                            {isLogin ? "أدخل بياناتك للمتابعة" : "ابدأ رحلة التفوق معنا اليوم"}
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleLogin}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <Input
                                        type="email"
                                        placeholder="البريد الإلكتروني"
                                        icon={Mail}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-primary/50 text-right h-12 text-base rounded-2xl"
                                        required
                                    />
                                    <div className="space-y-2">
                                        <Input
                                            type="password"
                                            placeholder="كلمة المرور"
                                            icon={Lock}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-white/5 border-white/10 focus:border-primary/50 text-right h-12 text-base rounded-2xl"
                                            required
                                        />
                                        <div className="text-left">
                                            <button type="button" className="text-xs text-primary hover:text-primary-hover transition-colors">
                                                نسيت كلمة المرور؟
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:scale-[1.02]"
                                    size="lg"
                                    isLoading={isLoading}
                                >
                                    تسجيل الدخول
                                </Button>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050505] px-2 text-slate-500">أو</span></div>
                                </div>

                                <div className="text-center text-sm text-slate-400">
                                    ليس لديك حساب؟{" "}
                                    <button
                                        type="button"
                                        onClick={() => setIsLogin(false)}
                                        className="text-primary font-bold hover:text-primary-hover transition-colors inline-flex items-center gap-1 group"
                                    >
                                        انضم إلينا
                                        <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="signup-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SignUp onToggleLogin={() => setIsLogin(true)} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// Main Page Component
export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <AuthContent />
        </Suspense>
    );
}
