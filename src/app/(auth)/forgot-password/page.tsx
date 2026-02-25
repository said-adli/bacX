import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
    title: "نسيت كلمة المرور | Brainy",
    description: "استعادة كلمة المرور لحسابك في منصة Brainy",
};

export default function ForgotPasswordPage() {
    return (
        <div className="w-full max-w-md glass-card p-8 sm:p-10 shadow-2xl" dir="rtl">
            <Link href="/">
                <img src="/images/logo.png" alt="Brainy Logo" className="h-14 w-auto mx-auto mb-8 object-contain drop-shadow-md" />
            </Link>

            {/* Heading */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">نسيت كلمة المرور؟</h1>
                <p className="text-sm text-zinc-400">أدخل بريدك الإلكتروني وسنرسل لك رمزاً مكوناً من 6 أرقام لإعادة تعيين كلمة المرور</p>
            </div>

            <ForgotPasswordForm />

            {/* Back to Login */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
                >
                    <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    العودة لصفحة الدخول
                </Link>
            </div>
        </div>
    );
}
