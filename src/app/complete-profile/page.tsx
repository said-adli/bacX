"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle, MapPin, BookOpen, LogOut } from "lucide-react";
import { toast } from "sonner";
import { ALGERIAN_WILAYAS } from "@/lib/data/wilayas";
import { motion } from "framer-motion";
import { NeuralBackground } from "@/components/ui/NeuralBackground";

export default function CompleteProfilePage() {
    const { user, profile, loading, completeOnboarding, logout } = useAuth();
    const router = useRouter();

    // Form State
    const [fullName, setFullName] = useState("");
    const [wilaya, setWilaya] = useState("");
    const [major, setMajor] = useState("شعبة علوم تجريبية"); // Default
    const [isLoading, setIsLoading] = useState(false);

    const MAJORS = [
        "شعبة علوم تجريبية",
        "شعبة رياضيات",
        "شعبة تقني رياضي",
        "شعبة تسيير واقتصاد",
        "شعبة آداب وفلسفة",
        "شعبة لغات أجنبية"
    ];

    // Initialize with existing data if available
    useEffect(() => {
        if (user) {
            setFullName(prev => prev || user.displayName || "");
        }
        if (profile) {
            setFullName(prev => prev || profile.fullName || profile.displayName || "");
        }
    }, [user, profile]);

    // Protect Route
    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in -> Go to Login
                router.replace("/auth/login");
            } else if (profile && Boolean(profile.wilaya) && Boolean(profile.major)) {
                // Already complete -> Go to Dashboard
                router.replace("/dashboard");
            }
        }
    }, [user, profile, loading, router]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim()) return toast.error("الاسم الكامل مطلوب");
        if (!wilaya) return toast.error("يرجى اختيار الولاية");

        setIsLoading(true);
        try {
            await completeOnboarding({
                fullName,
                wilaya,
                major,
            });

            toast.success("تم تحديث البيانات بنجاح!");
            // Redirect handled by AuthContext or Effect
        } catch (error) {
            console.error(error);
            toast.error("فشل حفظ البيانات");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-tajawal direction-rtl">
            <NeuralBackground />

            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[100px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[480px] z-10 p-4"
            >
                <div className="bg-[#0A0A0F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

                    {/* Logout Option */}
                    <button
                        onClick={() => logout()}
                        className="absolute top-6 left-6 text-slate-500 hover:text-red-400 transition-colors"
                        title="تسجيل الخروج"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>

                    <div className="mb-8 text-center mt-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mb-4 ring-1 ring-blue-500/20">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">أكمل ملفك الشخصي</h2>
                        <p className="text-slate-400 text-sm">خطوة أخيرة لتخصيص تجربتك الدراسية.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <Input
                                placeholder="الاسم الكامل"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-white/5 border-white/10 text-right h-12 text-white placeholder:text-slate-500 focus:border-blue-500/50"
                                dir="rtl"
                            />

                            <div className="relative">
                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                                <select
                                    value={wilaya}
                                    onChange={(e) => setWilaya(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 pr-12 text-zinc-200 outline-none focus:border-blue-500/50 appearance-none text-base transition-colors hover:border-white/20 cursor-pointer"
                                    dir="rtl"
                                >
                                    <option value="" className="bg-[#0A0A0F] text-slate-500">اختر الولاية...</option>
                                    {ALGERIAN_WILAYAS.map(w => (
                                        <option key={w.id} value={w.name} className="bg-[#0A0A0F] text-white">
                                            {w.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                                <select
                                    value={major}
                                    onChange={(e) => setMajor(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 pr-12 text-zinc-200 outline-none focus:border-blue-500/50 appearance-none text-base transition-colors hover:border-white/20 cursor-pointer"
                                    dir="rtl"
                                >
                                    {MAJORS.map(m => (
                                        <option key={m} value={m} className="bg-[#0A0A0F] text-white">
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-900/20"
                            isLoading={isLoading}
                        >
                            حفظ وانطلاق 🚀
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
