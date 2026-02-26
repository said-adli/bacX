"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { verifyOtpAction, resendOtpAction } from "@/actions/auth";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { SmartButton } from "@/components/ui/SmartButton";
import { useSearchParams } from "next/navigation";

interface VerifyOtpFormProps {
    email: string; // Passed from server component, may be empty if not awaited properly in Next 15+
    type: "signup" | "recovery";
}

export function VerifyOtpForm({ email: initialEmail, type: initialType }: VerifyOtpFormProps) {
    const searchParams = useSearchParams();
    const email = searchParams?.get("email") || initialEmail || "";
    const type = (searchParams?.get("type") as "signup" | "recovery") || initialType || "signup";

    const [state, formAction, isPending] = useActionState(verifyOtpAction, null);

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

    // OTP String State & Single Input Focus State
    const [otp, setOtp] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Error translation
    const getTranslatedError = (errorMsg: string | undefined) => {
        if (!errorMsg) return "";
        const lower = errorMsg.toLowerCase();
        if (lower.includes("invalid") || lower.includes("expired") || lower.includes("token")) {
            return "رمز التحقق خاطئ أو منتهي الصلاحية";
        }
        return errorMsg;
    };

    const translatedError = getTranslatedError(state?.error);

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

            {translatedError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start text-red-400 animate-shake">
                    <AlertCircle className="w-5 h-5 ml-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{translatedError}</p>
                </div>
            )}

            <form action={formAction} className="space-y-8">
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="type" value={type} />
                <input type="hidden" name="token" value={otp} />

                {/* OTP Input Container */}
                <div
                    className="relative flex justify-center w-full"
                    dir="ltr"
                    onClick={() => {
                        inputRef.current?.focus();
                        setIsFocused(true);
                    }}
                >
                    {/* The absolute hidden real input */}
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setOtp(val);
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                        disabled={isPending}
                        autoFocus
                    />

                    {/* The 6 visual boxes */}
                    <div className="flex gap-2 sm:gap-3 w-full justify-center">
                        {[0, 1, 2, 3, 4, 5].map((index) => {
                            // Highlight the current unfilled slot, or the last slot if fully filled
                            const isCurrentSlot = otp.length === index || (otp.length === 6 && index === 5);
                            const highlight = isFocused && isCurrentSlot && !isPending;

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center justify-center w-[3rem] h-14 sm:w-[3.5rem] sm:h-16 text-2xl font-bold text-center text-white bg-white/10 border-2 rounded-xl transition-all ${highlight ? "border-blue-500 bg-white/20 ring-4 ring-blue-500/20" : "border-white/20"
                                        }`}
                                >
                                    {otp[index] || ""}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-2">
                    <SmartButton
                        disabled={otp.length !== 6 || isPending}
                        pendingText="جاري التحقق..."
                        className="w-full h-12 sm:h-14 !text-base sm:!text-lg font-bold !rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        تأكيد الرمز
                    </SmartButton>
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
