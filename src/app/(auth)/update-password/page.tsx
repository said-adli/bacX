"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Lock, AlertCircle } from "lucide-react";
import { updatePasswordAction } from "./actions";
import { useEffect } from "react";
import { toast } from "sonner";

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
                    <span>جاري التحديث...</span>
                </>
            ) : "تحديث كلمة المرور"}
        </button>
    );
}

export default function UpdatePasswordPage() {
    const [state, formAction] = useFormState(updatePasswordAction, { error: "" });

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div dir="rtl">
            {/* Heading */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">تعيين كلمة مرور جديدة</h1>
                <p className="text-sm text-zinc-400">قم باختيار كلمة مرور قوية لحماية حسابك</p>
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
                <div className="space-y-4">
                    {/* Password Input */}
                    <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        <input
                            name="password"
                            type="password"
                            placeholder="كلمة المرور الجديدة"
                            required
                            minLength={6}
                            className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all text-sm"
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="تأكيد كلمة المرور"
                            required
                            minLength={6}
                            className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all text-sm"
                        />
                    </div>
                </div>

                <SubmitButton />
            </form>
        </div>
    );
}
