"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainyStoneLogoSVG } from "@/components/ui/BrainyStoneLogoSVG";
import { Mail, Lock, User, MapPin, BookOpen, AlertCircle, ChevronDown, ArrowLeft } from "lucide-react";
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
            className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 shadow-lg shadow-white/5 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm tracking-wide"
            isLoading={pending}
        >
            {pending ? "..." : "إنشاء حساب"}
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
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#050505] text-white font-tajawal py-10">

            {/* Ambient Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-900/5 blur-[150px] rounded-full opacity-40 mix-blend-screen" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-900/5 blur-[150px] rounded-full opacity-40 mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Breathing Logo */}
                <div className="flex justify-center mb-10">
                    <motion.div
                        className="w-16 h-16 relative"
                        animate={{
                            filter: ["drop-shadow(0 0 0px rgba(59,130,246,0))", "drop-shadow(0 0 15px rgba(59,130,246,0.3))", "drop-shadow(0 0 0px rgba(59,130,246,0))"]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <BrainyStoneLogoSVG />
                    </motion.div>
                </div>

                <GlassCard className="p-8 border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/50">

                    {state?.error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/10 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-400 text-xs"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{state.error}</span>
                        </motion.div>
                    )}

                    <form action={formAction} className="space-y-4">

                        {/* FULL NAME */}
                        <div className="relative group">
                            <Input
                                name="fullName"
                                type="text"
                                placeholder="الاسم الكامل"
                                icon={User}
                                required
                                className="bg-black/40 border-white/5 focus:border-white/20 text-white placeholder:text-white/20 h-12 text-sm transition-all group-hover:bg-black/50"
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
                                className="bg-black/40 border-white/5 focus:border-white/20 text-white placeholder:text-white/20 h-12 text-sm transition-all group-hover:bg-black/50"
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
                                className="bg-black/40 border-white/5 focus:border-white/20 text-white placeholder:text-white/20 h-12 text-sm transition-all group-hover:bg-black/50"
                            />
                        </div>

                        <div className="h-px bg-white/5 my-4 mx-4" />

                        {/* WILAYA & MAJOR */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 z-10">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <select
                                    name="wilaya_id"
                                    defaultValue=""
                                    className="w-full bg-black/40 border-white/5 rounded-xl px-4 py-3 pr-12 text-white/80 appearance-none focus:outline-none focus:border-white/20 transition-all text-sm h-12 placeholder:text-white/20"
                                    required
                                >
                                    <option value="" disabled className="bg-black text-white/50">اختر الولاية</option>
                                    {wilayas.map(w => (
                                        <option key={w.id} value={w.id} className="bg-black text-white">{w.id} - {w.full_label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-white/20" />
                            </div>

                            <div className="relative group">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 z-10">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <select
                                    name="major_id"
                                    defaultValue=""
                                    className="w-full bg-black/40 border-white/5 rounded-xl px-4 py-3 pr-12 text-white/80 appearance-none focus:outline-none focus:border-white/20 transition-all text-sm h-12 placeholder:text-white/20"
                                    required
                                >
                                    <option value="" disabled className="bg-black text-white/50">اختر الشعبة</option>
                                    {majors.map(m => (
                                        <option key={m.id} value={m.id} className="bg-black text-white">{m.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-white/20" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <SubmitButton />
                        </div>
                    </form>

                    <div className="mt-8 text-center flex flex-col gap-3">
                        <Link href="/login" className="text-white/30 hover:text-white text-xs transition-colors duration-300">
                            لديك حساب بالفعل؟ تسجيل الدخول
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
