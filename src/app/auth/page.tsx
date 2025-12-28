"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, User } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
    const { user, loading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) return null; // Or a spinner

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            router.push('/dashboard');
        } catch (error: any) {
            console.error(error);
            alert("حدث خطأ: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#1e1b4b]/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#020617]/40 blur-[100px] rounded-full" />
            </div>

            <GlassCard className="w-full max-w-[420px] p-8 relative z-10 border-white/5 bg-black/40">
                <div className="text-center mb-8">
                    <h1 className="font-tajawal font-bold text-3xl text-white mb-2">
                        {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
                    </h1>
                    <p className="font-tajawal text-zinc-400">
                        {isLogin ? "مرحباً بعودتك إلى منصة النخبة" : "ابدأ رحلتك نحو التفوق"}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    <motion.form
                        key={isLogin ? "login" : "signup"}
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        transition={{ duration: 0.4 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {!isLogin && (
                            <Input
                                placeholder="الاسم الكامل"
                                icon={User}
                                className="bg-white/5 border-white/10 focus:border-white/20"
                            />
                        )}

                        <Input
                            type="email"
                            placeholder="البريد الإلكتروني"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-white/20"
                        />

                        <Input
                            type="password"
                            placeholder="كلمة المرور"
                            icon={Lock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-white/20"
                        />

                        <Button
                            className="w-full mt-6 bg-white text-black hover:bg-zinc-200"
                            size="lg"
                            isLoading={isLoading}
                        >
                            {isLogin ? "دخول" : "إنشاء حساب"}
                        </Button>
                    </motion.form>
                </AnimatePresence>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-zinc-500 hover:text-white transition-colors font-tajawal"
                    >
                        {isLogin ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ سجل دخولك"}
                    </button>
                </div>
            </GlassCard>
        </main>
    );
}
