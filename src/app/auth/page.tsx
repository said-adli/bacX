"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Changed from hooks to use context export directly or hooks if consistent
import { SignUp } from "@/components/auth/SignUp";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import type { AuthStatus } from "@/context/AuthContext";

// --- Google Icon SVG ---
const GoogleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84.81-.6z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// --- Types ---
type AuthView = 'login' | 'signup' | 'forgot-password';

function AuthContent() {
    const { user, profile, loading, loginWithEmail, loginWithGoogle, checkProfileStatus } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- State ---
    const [view, setView] = useState<AuthView>('login');
    const [isLoading, setIsLoading] = useState(false);

    // Login Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Forgot Password State
    const [resetEmail, setResetEmail] = useState("");
    const [resetSent, setResetSent] = useState(false);

    // --- Effects ---

    // 1. Initial View from URL
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'signup') setView('signup');
        else if (mode === 'login') setView('login');
    }, [searchParams]);

    // 2. Redirect Logic if Already Logged In
    useEffect(() => {
        if (!loading && user) {
            // Use the centralized status check
            const status = checkProfileStatus(user, profile);

            if (status === "REQUIRE_ONBOARDING") {
                router.replace("/complete-profile");
            } else {
                router.replace("/dashboard");
            }
        }
    }, [user, profile, loading, router, checkProfileStatus]);

    // --- Handlers ---

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await loginWithEmail(email, password);
            toast.success("تم تسجيل الدخول بنجاح");
            // Redirect handled by AuthContext internally or the useEffect above
        } catch (error) {
            console.error(error);
            toast.error("فشل تسجيل الدخول: تأكد من البيانات");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const status: AuthStatus = await loginWithGoogle();

            if (status === "REQUIRE_ONBOARDING") {
                router.replace("/complete-profile");
            } else {
                toast.success("تم تسجيل الدخول بنجاح");
                router.replace("/dashboard");
            }
        } catch (error) {
            console.error(error);
            toast.error("فشل تسجيل الدخول عبر Google");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) return toast.error("أدخل البريد الإلكتروني");

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetSent(true);
            toast.success("تم إرسال رابط استعادة كلمة المرور");
        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ. تأكد من البريد البريد الإلكتروني.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Renders ---

    // Handle go back with fallback
    const handleGoBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    if (loading) return null; // Or a loading spinner

    return (
        <div className="flex min-h-screen w-full bg-[#050505] overflow-hidden selection:bg-primary/30 text-foreground font-sans">

            {/* Go Back Button */}
            <button
                onClick={handleGoBack}
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 
                           bg-white/5 hover:bg-white/10 
                           backdrop-blur-md 
                           border border-white/10 hover:border-white/20
                           rounded-full
                           text-white/70 hover:text-white
                           transition-all duration-300 ease-out
                           group"
                aria-label="Go back"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span className="hidden sm:inline text-sm font-medium">رجوع</span>
            </button>

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
            </div>

            {/* RIGHT PANEL - FORM */}
            <div className="w-full lg:w-1/2 relative flex flex-col justify-center p-6 sm:p-12 lg:p-24 overflow-y-auto">
                <div className="lg:hidden absolute top-6 left-6">
                    <Logo />
                </div>

                <div className="w-full max-w-md mx-auto relative z-10 w-full">
                    <AnimatePresence mode="wait">

                        {/* VIEW: LOGIN */}
                        {view === 'login' && (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="mb-10">
                                    <h2 className="text-3xl font-bold text-white mb-2 font-serif">مرحباً بعودتك</h2>
                                    <p className="text-slate-400">أدخل بياناتك للمتابعة</p>
                                </div>

                                {/* Pro Google Button */}
                                <Button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full h-12 bg-white text-zinc-900 hover:bg-zinc-200 font-bold flex items-center justify-center gap-3 mb-6 rounded-2xl transition-all shadow-lg hover:shadow-white/10"
                                    disabled={isLoading}
                                >
                                    <GoogleIcon />
                                    المتابعة باستخدام Google
                                </Button>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050505] px-2 text-slate-500">أو</span></div>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-4">
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
                                            <button
                                                type="button"
                                                onClick={() => setView('forgot-password')}
                                                className="text-xs text-primary hover:text-primary-hover transition-colors"
                                            >
                                                نسيت كلمة المرور؟
                                            </button>
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
                                </form>

                                <div className="mt-8 text-center text-sm text-slate-400">
                                    ليس لديك حساب؟{" "}
                                    <button
                                        type="button"
                                        onClick={() => setView('signup')}
                                        className="text-primary font-bold hover:text-primary-hover transition-colors inline-flex items-center gap-1 group"
                                    >
                                        انضم إلينا
                                        <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* VIEW: SIGNUP */}
                        {view === 'signup' && (
                            <motion.div
                                key="signup"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="mb-10">
                                    <h2 className="text-3xl font-bold text-white mb-2 font-serif">أنشئ حسابك الجديد</h2>
                                    <p className="text-slate-400">ابدأ رحلة التفوق معنا اليوم</p>
                                </div>

                                {/* Pro Google Button for Signup */}
                                <Button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full h-12 bg-white text-zinc-900 hover:bg-zinc-200 font-bold flex items-center justify-center gap-3 mb-6 rounded-2xl transition-all shadow-lg hover:shadow-white/10"
                                    disabled={isLoading}
                                >
                                    <GoogleIcon />
                                    التسجيل باستخدام Google
                                </Button>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050505] px-2 text-slate-500">أو عبر البريد</span></div>
                                </div>

                                <SignUp onToggleLogin={() => setView('login')} />
                            </motion.div>
                        )}

                        {/* VIEW: FORGOT PASSWORD */}
                        {view === 'forgot-password' && (
                            <motion.div
                                key="forgot-password"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="mb-10">
                                    <h2 className="text-3xl font-bold text-white mb-2 font-serif">استعادة كلمة المرور</h2>
                                    <p className="text-slate-400">سرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
                                </div>

                                {resetSent ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center mb-8">
                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <h3 className="text-white font-bold mb-2">تم الإرسال!</h3>
                                        <p className="text-sm text-slate-400">تحقق من بريدك الإلكتروني (بما في ذلك الرسائل غير المرغوب فيها).</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleForgotPassword} className="space-y-6">
                                        <Input
                                            type="email"
                                            placeholder="البريد الإلكتروني"
                                            icon={Mail}
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="bg-white/5 border-white/10 focus:border-primary/50 text-right h-12 text-base rounded-2xl"
                                            required
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200"
                                            size="lg"
                                            isLoading={isLoading}
                                        >
                                            إرسال الرابط
                                        </Button>
                                    </form>
                                )}

                                <div className="mt-8 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setView('login')}
                                        className="text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto text-sm"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        العودة لتسجيل الدخول
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <AuthContent />
        </Suspense>
    );
}
