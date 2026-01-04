"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
    const { user, profile, loading, checkProfileStatus, loginWithEmail } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!loading && user) {
            const status = checkProfileStatus(user, profile);
            if (status === "REQUIRE_ONBOARDING") {
                router.replace("/complete-profile");
            } else {
                router.replace("/dashboard");
            }
        }
    }, [user, profile, loading, router, checkProfileStatus]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginWithEmail(email, password);
            toast.success("تم تسجيل الدخول بنجاح");
            // No router.push here - handled by loginWithEmail
        } catch (error) {
            console.error(error);
            toast.error("فشل تسجيل الدخول: تأكد من البيانات");
        }
    };

    if (loading) return null;

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-slate-100 relative overflow-hidden font-tajawal direction-rtl">

            {/* Background Ambience - Light & Blue */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full" />
            </div>

            {/* White Glass Card with Blue Tint/Glow */}
            <div className="w-full max-w-[420px] p-8 md:p-10 relative z-10 bg-white/80 backdrop-blur-xl border border-blue-100/50 shadow-2xl shadow-blue-500/10 rounded-3xl">
                <div className="text-center mb-8">
                    <h1 className="font-bold text-3xl text-slate-900 mb-2">
                        تسجيل الدخول
                    </h1>
                    <p className="text-slate-500 text-sm">
                        مرحباً بعودتك إلى منصة النخبة، استمر في تفوقك
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <Input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        icon={Mail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white border text-slate-900 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 text-right h-12 transition-all hover:border-blue-300"
                        iconClassName="text-blue-500"
                    />

                    <Input
                        type="password"
                        placeholder="كلمة المرور"
                        icon={Lock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white border text-slate-900 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 text-right h-12 transition-all hover:border-blue-300"
                        iconClassName="text-blue-500"
                    />

                    <Button
                        className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold h-12 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                        size="lg"
                        isLoading={loading}
                    >
                        دخول
                    </Button>

                    <div className="mt-6 text-center space-y-4">
                        <Link href="/auth/signup" className="text-sm text-slate-500 hover:text-blue-600 transition-colors inline-block">
                            ليس لديك حساب؟ <span className="font-bold text-blue-600 underline-offset-4 hover:underline">سجل الآن</span>
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
