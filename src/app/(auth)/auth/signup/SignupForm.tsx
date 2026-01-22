"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, User, MapPin, BookOpen, AlertCircle, ChevronDown, ArrowLeft, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { signupAction } from "./actions";
import { useEffect } from "react";
import { toast } from "sonner";

// Define Props for the component
interface SignupFormProps {
    wilayas: { id: number; full_label: string }[];
    majors: { id: string; label: string }[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold h-14 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-lg border border-white/20"
            isLoading={pending}
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الانضمام...</span>
                </div>
            ) : "انضم إلى Brainy"}
        </Button>
    );
}

const initialState = {
    error: "",
    success: false
};

export default function SignupForm({ wilayas, majors }: SignupFormProps) {
    const [state, formAction] = useFormState(signupAction, initialState);

    useEffect(() => {
        if (state?.success) {
            toast.success("تم إنشاء الحساب بنجاح!");
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <main className="min-h-screen w-full bg-mesh-dynamic flex items-center justify-center p-4 relative overflow-hidden py-10 md:py-16">

            {/* Ambient Lighting Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '7s' }} />
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
                                انضم لنخبة المتفوقين
                                <br />
                                <span className="text-lg text-white/50 block mt-2">مستقبلك يبدأ بخطوة</span>
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* RIGHT COLUMN - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-lg lg:max-w-[480px] relative z-10"
                    >
                        <div className="glass-login rounded-[2.5rem] p-8 md:p-10 border border-white/10 relative overflow-hidden">
                            {/* Inner Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

                            {/* Logo Section (Mobile Only) */}
                            <div className="flex flex-col items-center justify-center mb-8 gap-5 relative z-10 lg:hidden">
                                <motion.div
                                    className="w-20 h-20 relative"
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
                                        className="object-contain"
                                        style={{ filter: 'invert(1) brightness(2) drop-shadow(0 0 2px white)' }}
                                        priority
                                    />
                                </motion.div>
                                <motion.h1
                                    className="text-4xl font-bold text-metallic tracking-wider uppercase font-serif"
                                >
                                    Brainy
                                </motion.h1>
                            </div>

                            {/* Desktop Heading (Simple) */}
                            <div className="hidden lg:block text-center mb-10 relative z-10">
                                <h2 className="text-3xl font-bold text-white mb-2">إنشاء حساب جديد</h2>
                                <p className="text-white/50 text-sm">سجل الآن وابدأ التعلم</p>
                            </div>

                            {/* Header Text (Mobile) */}
                            <div className="text-center mb-8 relative z-10 lg:hidden">
                                <h2 className="text-xl font-medium text-white/90">حساب جديد</h2>
                                <p className="text-white/40 text-sm mt-3 font-light">ابدأ رحلة التفوق مع نخبة أساتذة الجزائر</p>
                            </div>

                            {state?.error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-300 text-sm backdrop-blur-sm relative z-10"
                                >
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span>{state.error}</span>
                                </motion.div>
                            )}

                            <form action={formAction} className="space-y-4 relative z-10">

                                {/* FULL NAME */}
                                <div className="relative group">
                                    <Input
                                        name="fullName"
                                        type="text"
                                        placeholder="الاسم الكامل"
                                        icon={User}
                                        required
                                        className="input-premium h-14 text-right pr-4 rounded-2xl text-white placeholder:text-white/30"
                                        dir="rtl"
                                    />
                                </div>

                                {/* EMAIL */}
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

                                {/* PASSWORD */}
                                <div className="relative group">
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="كلمة المرور"
                                        icon={Lock}
                                        required
                                        minLength={6}
                                        className="input-premium h-14 text-right pr-4 rounded-2xl text-white placeholder:text-white/30"
                                        dir="rtl"
                                    />
                                </div>

                                <div className="h-px bg-white/5 my-6 mx-4" />

                                {/* STUDY SYSTEM */}
                                <div className="relative group">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 z-10 transition-colors group-hover:text-blue-300 drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <select
                                        name="study_system"
                                        defaultValue=""
                                        className="w-full input-premium h-14 rounded-2xl px-4 py-3 pr-12 text-white/90 appearance-none focus:outline-none transition-all text-sm placeholder:text-white/30 cursor-pointer"
                                        required
                                        dir="rtl"
                                    >
                                        <option value="" disabled className="bg-[#0B0E14] text-white/50">نظام الدراسة</option>
                                        <option value="regular" className="bg-[#0B0E14] text-white py-2">طالب نظامي</option>
                                        <option value="private" className="bg-[#0B0E14] text-white py-2">طالب حر (Candidat Libre)</option>
                                    </select>
                                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-white/20 transition-transform group-hover:text-white/50" />
                                </div>

                                {/* WILAYA & MAJOR */}
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 z-10 transition-colors group-hover:text-blue-300 drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <select
                                            name="wilaya_id"
                                            defaultValue=""
                                            className="w-full input-premium h-14 rounded-2xl px-4 py-3 pr-12 text-white/90 appearance-none focus:outline-none transition-all text-sm placeholder:text-white/30 cursor-pointer"
                                            required
                                            dir="rtl"
                                        >
                                            <option value="" disabled className="bg-[#0B0E14] text-white/50">اختر الولاية</option>
                                            {wilayas.map(w => (
                                                <option key={w.id} value={w.id} className="bg-[#0B0E14] text-white">{w.id} - {w.full_label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-white/20 transition-transform group-hover:text-white/50" />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 z-10 transition-colors group-hover:text-blue-300 drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <select
                                            name="major_id"
                                            defaultValue=""
                                            className="w-full input-premium h-14 rounded-2xl px-4 py-3 pr-12 text-white/90 appearance-none focus:outline-none transition-all text-sm placeholder:text-white/30 cursor-pointer"
                                            required
                                            dir="rtl"
                                        >
                                            <option value="" disabled className="bg-[#0B0E14] text-white/50">اختر الشعبة</option>
                                            {majors.map(m => (
                                                <option key={m.id} value={m.id} className="bg-[#0B0E14] text-white">{m.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-white/20 transition-transform group-hover:text-white/50" />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <SubmitButton />
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-white/10 text-center flex flex-col gap-5 relative z-10">
                                <div className="text-sm text-white/40">
                                    لديك حساب بالفعل؟{" "}
                                    <Link href="/login" className="text-blue-400 hover:text-white font-bold transition-colors ml-1">
                                        سجل دخولك
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
