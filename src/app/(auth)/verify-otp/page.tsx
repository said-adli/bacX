"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { verifyOtpAction } from "@/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

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
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 sm:px-6 lg:px-8 relative z-10 py-12">

            {/* Logo */}
            <div className="mb-8 animate-fade-in-up">
                <Link href="/" className="inline-block relative">
                    <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-50"></div>
                    <img
                        src="/image/logo.png"
                        alt="Brainy"
                        className="relative z-10 mx-auto h-12 sm:h-16 object-contain drop-shadow-lg"
                    />
                </Link>
            </div>

            <div className="w-full max-w-[90%] sm:max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                    {/* Decorative Gradients */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                                التحقق من الحساب
                            </h2>
                            <p className="text-white/60 text-sm leading-relaxed">
                                {type === "signup"
                                    ? "أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني"
                                    : "أدخل الرمز المكون من 6 أرقام لإعادة تعيين كلمة المرور الخاصة بك"}
                            </p>
                            <div className="mt-2 text-primary font-medium text-sm px-3 py-1 bg-primary/10 rounded-full inline-block">
                                {email}
                            </div>
                        </div>

                        {state?.error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start text-red-400 animate-shake">
                                <AlertCircle className="w-5 h-5 ml-3 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{state.error}</p>
                            </div>
                        )}

                        <form action={formAction} className="space-y-6">
                            <input type="hidden" name="email" value={email} />
                            <input type="hidden" name="type" value={type} />
                            <input type="hidden" name="token" value={combinedOtp} />

                            <div className="flex justify-between items-center gap-2 sm:gap-4 mb-8" dir="ltr">
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
                                        className="w-10 h-12 sm:w-12 sm:h-14 flex-1 text-center text-xl sm:text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none"
                                    />
                                ))}
                            </div>

                            <div className="space-y-4 pt-2">
                                <Button
                                    type="submit"
                                    disabled={!isComplete || isPending}
                                    className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/25 border-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                    <span className="relative flex items-center justify-center gap-2">
                                        {isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                جاري التحقق...
                                            </>
                                        ) : (
                                            <>
                                                تأكيد الرمز
                                                <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </div>

                            <div className="text-center mt-6">
                                <p className="text-white/50 text-sm">
                                    لم تستلم الرمز؟ <span className="text-primary hover:text-primary-foreground transition-colors cursor-pointer">إعادة الإرسال</span>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
