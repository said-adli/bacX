"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { verifyOtpAction } from "@/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function VerifyOtpPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const type = searchParams.get("type") as "signup" | "recovery" || "signup";

    const [state, formAction, isPending] = useActionState(verifyOtpAction, null);

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
            const pastedData = value.slice(0, 6).split("");
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
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-6 relative z-10 py-12">

            <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] animate-fade-in-up relative overflow-hidden">

                {/* Decorative Gradients for depth */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    {/* Logo exact match */}
                    <Link href="/" className="block text-center mb-8">
                        <img
                            src="/image/logo.png"
                            alt="Brainy"
                            className="h-16 mx-auto object-contain drop-shadow-lg"
                        />
                    </Link>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                            التحقق من الحساب
                        </h2>
                        <p className="text-white/70 text-sm leading-relaxed">
                            {type === "signup"
                                ? "أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني"
                                : "أدخل الرمز المكون من 6 أرقام لإعادة تعيين كلمة المرور الخاصة بك"}
                        </p>
                        <div className="mt-4 text-blue-400 font-medium text-sm px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full inline-block">
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

                        {/* OTP Inputs with exact styling match */}
                        <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
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
                                    className="w-12 h-14 sm:w-14 sm:h-16 text-2xl sm:text-3xl font-bold text-center text-white bg-white/10 border-2 border-white/20 rounded-xl focus:border-blue-500 focus:bg-white/20 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
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
                                لم تستلم الرمز؟ <button type="button" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer font-medium bg-transparent border-0 p-0">إعادة الإرسال</button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
