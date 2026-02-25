"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { verifyOtpAction, resendOtpAction } from "@/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function VerifyOtpPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const type = searchParams.get("type") as "signup" | "recovery" || "signup";

    const [state, formAction, isPending] = useActionState(verifyOtpAction, null);

    const [cooldown, setCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

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
        setIsResending(true);
        const res = await resendOtpAction(email, type);
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

    return (
        <div className="min-h-screen flex w-full bg-[#0a0f1c]">
            {/* Left Side (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-[#0a0f1c]">
                {/* Glowing Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>

                <div className="relative z-10 text-center px-8 sm:px-12">
                    <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                        مرحباً بك في منصتنا التعليمية
                    </h1>
                    <p className="text-lg text-blue-100/80 max-w-lg mx-auto leading-relaxed">
                        نقدم لك أفضل تجربة تعليمية مع أحدث التقنيات وأفضل الخبراء في مختلف المجالات.
                    </p>
                </div>
            </div>

            {/* Right Side (Form Area) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10">
                    <Link href="/" className="block text-center flex justify-center">
                        <img src="/images/logo.png" alt="Brainy" className="h-12 mb-8 object-contain" />
                    </Link>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                            التحقق من الحساب
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
                            <Button
                                type="submit"
                                disabled={!isComplete || isPending}
                                className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                                            جاري التحقق...
                                        </>
                                    ) : (
                                        <>
                                            تأكيد الرمز
                                            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </Button>
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
            </div>
        </div>
    );
}
