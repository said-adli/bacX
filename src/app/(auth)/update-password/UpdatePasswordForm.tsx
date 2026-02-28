"use client";

import { useFormState } from "react-dom";
import { Lock, AlertCircle } from "lucide-react";
import { updatePasswordAction } from "./actions";
import { useEffect } from "react";
import { toast } from "sonner";
import { SmartButton } from "@/components/ui/SmartButton";

export function UpdatePasswordForm() {
    const [state, formAction] = useFormState(updatePasswordAction, { error: "" });

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-5">
            {/* Error Message */}
            {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-center gap-3 text-red-300 text-sm animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

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

            <SmartButton
                pendingText="جاري التحديث..."
                className="w-full h-11 !rounded-xl"
            >
                تحديث كلمة المرور
            </SmartButton>
        </form>
    );
}
