"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { verifyOtpAction, resendOtpAction } from "@/actions/auth";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/ui/SubmitButton";

interface VerifyOtpFormProps {
    email: string;
    type: "signup" | "recovery";
}

export function VerifyOtpForm({ email, type }: VerifyOtpFormProps) {
    const [state, formAction] = useActionState(verifyOtpAction, null);

    const [cooldown, setCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    // Handle Signup Success
    useEffect(() => {
        if (state?.success && type === "signup") {
            toast.success('تم تفعيل حسابك بنجاح! مرحباً بك في Brainy');
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);
        }
    }, [state, type]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [cooldown]);

    const handleResend = async () => {
        if (!email || !type) return;

        console.log("Client Resend Triggered:", { email, type });
        setIsResending(true);

        // Ensure type correctly matches what Supabase expects
        const resendType = type === 'recovery' ? 'recovery' : 'signup';
        const res = await resendOtpAction(email, resendType);

        setIsResending(false);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('تم إعادة إرسال الرمز');
            setCooldown(60);
        }
    };

    // OTP Input State
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Initialize refs array
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedData = value.replace(/\D/g, "").slice(0, 6).split("");
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) {
                    newOtp[index + i] = pastedData[i];
                }
            }
            setOtp(newOtp);
            // Focus last filled input
            const nextIndex = Math.min(index + pastedData.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if filled
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const isComplete = otp.every((digit) => digit !== "");
    const combinedOtp = otp.join("");

    if (state?.success) {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in zoom-in duration-500">
                <div className="relative flex items-center justify-center w-24 h-24">
                    <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse"></div>
                    <CheckCircle className="w-16 h-16 text-green-400 relative z-10 animate-bounce" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">تم التحقق بنجاح!</h2>
                    <p className="text-green-200/80 text-sm sm:text-base">جاري نقلك إلى لوحة التحكم...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                    {type === 'signup' ? 'تفعيل الحساب' : 'استعادة كلمة المرور'}
                </h2>
                <p className="text-white/70 text-sm leading-relaxed mt-2 mb-4">
                    {type === "signup"
                        ? "أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني"
                        : "أدخل الرمز المكون من 6 أرقام لإعادة تعيين كلمة المرور الخاصة بك"}
                </p>
                <div className="text-blue-400 font-medium text-sm px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full inline-block">
                    {email}
                </div>
            </div>

            {state?.error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start text-red-400 animate-shake">
                    <AlertCircle className="w-5 h-5 ml-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{state.error}</p>
                </div>
            )}

            <form action={formAction} className="space-y-8">
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="type" value={type} />
                <input type="hidden" name="token" value={combinedOtp} />

                {/* OTP Inputs */}
                <div className="grid grid-cols-6 gap-2 sm:gap-3 w-full" dir="ltr">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-full max-w-[3.5rem] h-14 sm:h-16 text-2xl font-bold text-center text-white bg-white/10 border-2 border-white/20 rounded-xl focus:border-blue-500 focus:bg-white/20 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                        />
                    ))}
                </div>

                <div className="pt-2">
                    <SubmitButton
                        disabled={!isComplete}
                        pendingText="جاري التحقق..."
                        className="w-full h-12 sm:h-14 !text-base sm:!text-lg font-bold !rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        تأكيد الرمز
                    </SubmitButton>
                </div>

                <div className="text-center mt-6">
                    <p className="text-white/50 text-sm">
                        لم تستلم الرمز؟ <button
                            type="button"
                            onClick={handleResend}
                            disabled={cooldown > 0 || isResending}
                            className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-medium disabled:text-zinc-500 disabled:cursor-not-allowed bg-transparent border-0 p-0"
                        >
                            {isResending ? 'جاري الإرسال...' : cooldown > 0 ? `إعادة الإرسال (${cooldown}ث)` : 'إعادة الإرسال'}
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
}
