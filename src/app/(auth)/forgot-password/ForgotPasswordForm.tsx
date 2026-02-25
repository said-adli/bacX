"use client";

import { useFormState } from "react-dom";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import { forgotPasswordAction } from "./actions";
import { useEffect } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ForgotPasswordForm() {
    const [state, formAction] = useFormState(forgotPasswordAction, { error: "", success: "" });

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
        if (state?.success) {
            toast.success(state.success);
        }
    }, [state]);

    return (
        <>
            {/* Success Message */}
            {state?.success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-start gap-3 text-green-300 text-sm animate-fade-in">
                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-bold">تم إرسال الرابط بنجاح!</p>
                        <p className="opacity-90">{state.success}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-center gap-3 text-red-300 text-sm animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

            {/* Form */}
            {!state?.success && (
                <form action={formAction} className="space-y-5">
                    <div className="space-y-4">
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
                    </div>

                    <SubmitButton
                        pendingText="جاري الإرسال..."
                        className="w-full h-11 !rounded-xl"
                    >
                        إرسال رمز التحقق
                    </SubmitButton>
                </form>
            )}
        </>
    );
}
