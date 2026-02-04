"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Mail, Lock, User, MapPin, BookOpen, AlertCircle, ChevronDown, GraduationCap } from "lucide-react";
import { signupAction } from "./actions";
import { useEffect } from "react";
import { toast } from "sonner";

interface SignupFormProps {
    wilayas: { id: number; name_ar: string; name_en: string }[];
    majors: { id: string; label: string }[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:via-blue-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {pending ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الانضمام...</span>
                </>
            ) : "إنشاء الحساب"}
        </button>
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

    const inputBaseClass = "w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all text-sm";
    const selectBaseClass = "w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-10 text-white appearance-none focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all text-sm cursor-pointer";

    return (
        <div dir="rtl">
            {/* Heading */}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">إنشاء حساب جديد</h1>
                <p className="text-sm text-zinc-400">انضم إلى منصة المتفوقين</p>
            </div>

            {/* Error Message */}
            {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 flex items-center gap-3 text-red-300 text-sm animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

            {/* Form */}
            <form action={formAction} className="space-y-4">
                {/* Full Name */}
                <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                        name="fullName"
                        type="text"
                        placeholder="الاسم الكامل"
                        required
                        className={inputBaseClass}
                    />
                </div>

                {/* Email */}
                <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                        name="email"
                        type="email"
                        placeholder="البريد الإلكتروني"
                        required
                        className={inputBaseClass}
                    />
                </div>

                {/* Password */}
                <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                        name="password"
                        type="password"
                        placeholder="كلمة المرور"
                        required
                        minLength={6}
                        className={inputBaseClass}
                    />
                </div>

                {/* Divider */}
                <div className="h-px bg-white/5 my-2" />

                {/* Study System */}
                <div className="relative">
                    <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none z-10" />
                    <select
                        name="study_system"
                        defaultValue=""
                        className={selectBaseClass}
                        required
                    >
                        <option value="" disabled className="bg-zinc-900 text-zinc-500">نظام الدراسة</option>
                        <option value="regular" className="bg-zinc-900 text-white">طالب نظامي</option>
                        <option value="private" className="bg-zinc-900 text-white">طالب حر (Candidat Libre)</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>

                {/* Wilaya */}
                <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none z-10" />
                    <select
                        name="wilaya_id"
                        defaultValue=""
                        className={selectBaseClass}
                        required
                    >
                        <option value="" disabled className="bg-zinc-900 text-zinc-500">اختر الولاية</option>
                        {wilayas.map(w => (
                            <option key={w.id} value={w.id} className="bg-zinc-900 text-white">{w.id} - {w.name_ar}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>

                {/* Major */}
                <div className="relative">
                    <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none z-10" />
                    <select
                        name="major_id"
                        defaultValue=""
                        className={selectBaseClass}
                        required
                    >
                        <option value="" disabled className="bg-zinc-900 text-zinc-500">اختر الشعبة</option>
                        {majors.map(m => (
                            <option key={m.id} value={m.id} className="bg-zinc-900 text-white">{m.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>

                <div className="pt-2">
                    <SubmitButton />
                </div>
            </form>

            {/* Switch Link */}
            <div className="mt-6 pt-5 border-t border-white/5 text-center">
                <p className="text-sm text-zinc-500">
                    لديك حساب بالفعل؟{" "}
                    <Link
                        href="/login"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        سجل دخولك
                    </Link>
                </p>
            </div>
        </div>
    );
}
