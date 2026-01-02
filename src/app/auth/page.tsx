"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, MapPin, BookOpen, Check } from "lucide-react";
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { SignUp } from "@/components/auth/SignUp";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import { cn } from "@/lib/utils";
import { saveStudentData } from "@/lib/user";
import { ALGERIAN_WILAYAS } from "@/lib/data/wilayas";

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
type AuthView = 'login' | 'signup' | 'forgot-password' | 'onboarding';

function AuthContent() {
    const { user, userProfile, loading } = useAuth();
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

    // Onboarding State
    const [onboardingData, setOnboardingData] = useState({
        fullName: "",
        wilaya: "",
        major: "شعبة علوم تجريبية" // Default
    });

    const MAJORS = [
        "شعبة علوم تجريبية",
        "شعبة رياضيات",
        "شعبة تقني رياضي"
    ];

    // --- Effects ---

    // 1. Initial View from URL
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'signup') setView('signup');
        else if (mode === 'login') setView('login');
    }, [searchParams]);

    // 2. Redirect / Onboarding Logic
    useEffect(() => {
        if (!loading && user) {
            // Check if profile is complete
            if (userProfile) {
                const isProfileComplete =
                    Boolean(userProfile.wilaya) &&
                    Boolean(userProfile.major) &&
                    Boolean(userProfile.fullName || userProfile.displayName);

                if (isProfileComplete) {
                    router.replace("/dashboard");
                } else {
                    // Profile incomplete? Show onboarding
                    if (view !== 'onboarding') {
                        setOnboardingData(prev => ({
                            ...prev,
                            fullName: user.displayName || (userProfile.fullName as string) || prev.fullName
                        }));
                        setView('onboarding');
                    }
                }
            }
        }
    }, [user, userProfile, loading, router, view]);

    // --- Handlers ---

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("تم تسجيل الدخول بنجاح");
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
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
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

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!onboardingData.fullName.trim()) return toast.error("الاسم الكامل مطلوب");
        if (!onboardingData.wilaya) return toast.error("يرجى اختيار الولاية");

        setIsLoading(true);
        try {
            await saveStudentData({
                uid: user.uid,
                email: user.email || "",
                fullName: onboardingData.fullName,
                wilaya: onboardingData.wilaya,
                major: onboardingData.major
            }, { isNewUser: false });

            toast.success("تم تحديث البيانات بنجاح!");
            window.location.href = "/dashboard";

        } catch (error) {
            console.error(error);
            toast.error("فشل حفظ البيانات");
            setIsLoading(false);
        }
    };

    // --- Renders ---

    if (loading) return null;

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

                        {/* VIEW: ONBOARDING (Mandatory) */}
                        {view === 'onboarding' && (
                            <motion.div
                                key="onboarding"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-blue-900/10 to-transparent p-1 rounded-3xl"
                            >
                                <div className="bg-[#0A0A0F] border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

                                    <div className="mb-8 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mb-4 ring-1 ring-blue-500/20">
                                            <AlertCircle className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">أكمل ملفك الشخصي</h2>
                                        <p className="text-slate-400 text-sm">نحتاج لبعض المعلومات الإضافية لتخصيص تجربتك.</p>
                                    </div>

                                    <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                                        <Input
                                            placeholder="الاسم الكامل"
                                            value={onboardingData.fullName}
                                            onChange={(e) => setOnboardingData({ ...onboardingData, fullName: e.target.value })}
                                            className="bg-white/5 text-right"
                                            dir="rtl"
                                        />

                                        <div className="relative">
                                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                                            <select
                                                value={onboardingData.wilaya}
                                                onChange={(e) => setOnboardingData({ ...onboardingData, wilaya: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 pr-12 text-zinc-200 outline-none focus:border-primary/50 appearance-none text-base"
                                                dir="rtl"
                                            >
                                                <option value="" className="bg-[#0A0A0F] text-zinc-500">اختر الولاية...</option>
                                                {ALGERIAN_WILAYAS.map(w => (
                                                    <option key={w.id} value={w.name} className="bg-[#0A0A0F] text-white">
                                                        {w.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="relative">
                                            <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                                            <select
                                                value={onboardingData.major}
                                                onChange={(e) => setOnboardingData({ ...onboardingData, major: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 pr-12 text-zinc-200 outline-none focus:border-primary/50 appearance-none text-base"
                                                dir="rtl"
                                            >
                                                {MAJORS.map(m => (
                                                    <option key={m} value={m} className="bg-[#0A0A0F] text-white">
                                                        {m}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold mt-4"
                                            isLoading={isLoading}
                                        >
                                            حفظ ومتابعة
                                        </Button>
                                    </form>
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
