"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { loginAction } from "./actions";
import { useState, useEffect } from "react";

import { SmartButton } from "@/components/ui/SmartButton";

export default function LoginClient() {
    const [state, formAction] = useFormState(loginAction, { error: "" });

    // Initialize device ID lazily on the client side only
    const [deviceId] = useState(() => {
        if (typeof window === 'undefined') return "";
        let storedId = localStorage.getItem("brainy_device_id");
        if (!storedId) {
            storedId = crypto.randomUUID();
            localStorage.setItem("brainy_device_id", storedId);
        }
        return storedId;
    });

    // Handle error display separately
    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div dir="rtl">
            {/* Heading */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك مجدداً</h1>
                <p className="text-sm text-zinc-400">سجل دخولك للمتابعة</p>
            </div>

            {/* Error Message */}
            {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-center gap-3 text-red-300 text-sm animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

            {/* Form */}
            <form action={formAction} className="space-y-5">
                <input type="hidden" name="deviceId" value={deviceId} />

                <div className="space-y-4">
                    {/* Email Input */}
                    <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        <input
                            name="email"
                            type="email"
                            placeholder="البريد الإلكتروني"
                            required
                            className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all text-sm"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                            <input
                                name="password"
                                type="password"
                                placeholder="كلمة المرور"
                                required
                                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all text-sm"
                            />
                        </div>
                        <div className="flex justify-start px-1">
                            <Link
                                href="/forgot-password"
                                className="text-xs text-zinc-500 hover:text-blue-400 transition-colors"
                            >
                                نسيت كلمة المرور؟
                            </Link>
                        </div>
                    </div>
                </div>

                <SmartButton pendingText="جاري الدخول...">تسجيل الدخول</SmartButton>
            </form>

            {/* Switch Link */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-sm text-zinc-500">
                    لا تمتلك حساباً؟{" "}
                    <Link
                        href="/auth/signup"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        أنشئ حساب جديد
                    </Link>
                </p>
            </div>
        </div>
    );
}
