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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
            isLoading={pending}
        >
            {pending ? "..." : "انضم إلى Brainy"}
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {/* Breathing Logo */}
            <div className="flex justify-center mb-8">
                <motion.div
                    className="w-20 h-20 relative"
                    animate={{
                        filter: ["drop-shadow(0 0 0px rgba(59,130,246,0))", "drop-shadow(0 0 25px rgba(59,130,246,0.4))", "drop-shadow(0 0 0px rgba(59,130,246,0))"]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <BrainyStoneLogoSVG />
                </motion.div>
            </div>

            <GlassCard className="p-8 border-white/10 bg-white/5 backdrop-blur-[40px] shadow-[0_0_50px_rgba(37,99,235,0.1)] rounded-[2rem]">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white/60 bg-clip-text text-transparent">حساب جديد</h1>
                    <p className="text-white/40 text-sm mt-2">ابدأ رحلة التفوق مع نخبة أساتذة الجزائر</p>
                </div>

                {state?.error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-red-500/10 border border-red-500/10 rounded-xl p-3 mb-6 flex items-center gap-3 text-red-300 text-xs"
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
                            className="bg-white/5 border-white/10 focus:border-blue-400/50 focus:bg-white/10 text-white placeholder:text-white/20 h-14 text-right pr-4 rounded-xl transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
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
                            className="bg-white/5 border-white/10 focus:border-blue-400/50 focus:bg-white/10 text-white placeholder:text-white/20 h-14 text-right pr-4 rounded-xl transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
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
                            className="bg-white/5 border-white/10 focus:border-blue-400/50 focus:bg-white/10 text-white placeholder:text-white/20 h-14 text-right pr-4 rounded-xl transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                            dir="rtl"
                        />
                    </div>

                    <div className="h-px bg-white/5 my-4 mx-4" />

                    {/* WILAYA & MAJOR */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 z-10 transition-colors group-hover:text-blue-400">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <select
                                name="wilaya_id"
                                defaultValue=""
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white/90 appearance-none focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all text-sm h-14 placeholder:text-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                required
                                dir="rtl"
                            >
                                <option value="" disabled className="bg-[#0F0F12] text-white/50">اختر الولاية</option>
                                {wilayas.map(w => (
                                    <option key={w.id} value={w.id} className="bg-[#0F0F12] text-white">{w.id} - {w.full_label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-white/20" />
                        </div>

                        <div className="relative group">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 z-10 transition-colors group-hover:text-blue-400">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <select
                                name="major_id"
                                defaultValue=""
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white/90 appearance-none focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all text-sm h-14 placeholder:text-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                required
                                dir="rtl"
                            >
                                <option value="" disabled className="bg-[#0F0F12] text-white/50">اختر الشعبة</option>
                                {majors.map(m => (
                                    <option key={m.id} value={m.id} className="bg-[#0F0F12] text-white">{m.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-white/20" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-4">
                    <div className="text-xs text-white/30">
                        لديك حساب بالفعل؟{" "}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                            سجل دخولك
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
