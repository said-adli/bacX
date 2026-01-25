"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { loginAction } from "./actions";
import { useEffect } from "react";

// Zero JS Animations utilized via globals.css

export default function LoginClient() {
    const [state, formAction] = useFormState(loginAction, { error: "" });
    const { pending } = useFormStatus();

    // Show toast on error
    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

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
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in">
                        <div className="w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
                        <div className="w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow delay-1000" />
                    </div>

                    {/* Logo & Tagline */}
                    <div className="relative z-10 text-center space-y-8">
                        <div className="relative w-64 h-64 mx-auto animate-fade-in-up delay-200">
                            <div className="relative w-full h-full animate-float-slow">
                                <Image
                                    src="/images/brainy-logo-black.png"
                                    alt="Brainy Large Logo"
                                    fill
                                    className="object-contain"
                                    style={{ filter: 'invert(1) brightness(1.5) drop-shadow(0 0 20px rgba(59,130,246,0.5))', transform: 'translateZ(0)' }}
                                    priority
                                />
                            </div>
                        </div>

                        <div className="animate-fade-in-up delay-300">
                            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white/80 font-serif tracking-tight drop-shadow-lg">
                                Brainy
                            </h1>
                            <p className="mt-6 text-2xl text-blue-100/90 font-light leading-relaxed max-w-lg mx-auto" dir="rtl">
                                بوابتك نحو التميز الأكاديمي
                                <br />
                                <span className="text-lg text-white/50 block mt-2">رحلة التفوق تبدأ من هنا</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-0">
                    <div className="w-full max-w-md lg:max-w-[480px] relative z-10 animate-fade-in-up">
                        <div className="glass-login rounded-[2.5rem] p-8 md:p-10 border border-white/10 relative overflow-hidden">
                            {/* Inner Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

                            {/* Logo Section (Mobile Only) */}
                            <div className="flex flex-col items-center justify-center mb-10 gap-5 relative z-10 lg:hidden">
                                <div className="w-24 h-24 relative animate-float-slow">
                                    <Image
                                        src="/images/brainy-logo-black.png"
                                        alt="Brainy Logo"
                                        fill
                                        className="object-contain" // Preserves transparency
                                        style={{ filter: 'invert(1) brightness(2) drop-shadow(0 0 2px white)' }} // Pure white metallic feel
                                        priority
                                    />
                                </div>
                                <h1 className="text-5xl font-bold text-metallic tracking-wider uppercase font-serif">
                                    Brainy
                                </h1>
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
                            {state?.error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-300 text-sm backdrop-blur-sm animate-fade-in">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span>{state.error}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form action={formAction} className="space-y-6 relative z-10">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="البريد الإلكتروني"
                                            icon={Mail}
                                            required
                                            className="input-premium h-14 text-right pr-4 rounded-2xl text-white placeholder:text-white/30"
                                            dir="rtl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <Input
                                                name="password"
                                                type="password"
                                                placeholder="كلمة المرور"
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
                                        isLoading={pending}
                                    >
                                        {pending ? (
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
                    </div>
                </div>
            </div>
        </main>
    );
}
