"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveStudentData } from "@/lib/user";
import { ALGERIAN_WILAYAS } from "@/lib/data/wilayas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, MapPin, BookOpen, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SignupPage() {
    const { signupWithEmail } = useAuth();
    const router = useRouter(); // Keeping router if needed for anything else, though AuthContext handles nav. Actually, let's keep it clean.

    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        wilaya: "",
        major: "شعبة علوم تجريبية" // Default
    });

    const [showPassword, setShowPassword] = useState(false);

    const MAJORS = [
        "شعبة علوم تجريبية",
        "شعبة رياضيات",
        "شعبة تقني رياضي",
        "شعبة تسيير واقتصاد",
        "شعبة آداب وفلسفة",
        "شعبة لغات أجنبية"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName.trim()) return toast.error("الاسم الكامل مطلوب");
        if (!formData.wilaya) return toast.error("يرجى اختيار الولاية");
        if (formData.password.length < 8) return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");

        setIsLoading(true);
        try {
            await signupWithEmail({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                wilaya: formData.wilaya,
                major: formData.major
            });

            toast.success("تم إنشاء الحساب بنجاح!");
            // Navigation handled by AuthContext
        } catch (error) {
            console.error(error);
            if ((error as { code?: string }).code === 'auth/email-already-in-use') {
                toast.error("البريد الإلكتروني مستخدم بالفعل");
            } else {
                toast.error("حدث خطأ أثناء التسجيل");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return null;

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-slate-100 relative overflow-hidden font-tajawal direction-rtl text-right">

            {/* Background Ambience - Light & Blue */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full" />
            </div>

            {/* White Glass Card with Blue Tint/Glow */}
            <div className="w-full max-w-[480px] p-8 md:p-10 relative z-10 bg-white/80 backdrop-blur-xl border border-blue-100/50 shadow-2xl shadow-blue-500/10 rounded-3xl">
                <div className="text-center mb-8">
                    <h1 className="font-bold text-3xl text-slate-900 mb-2">
                        إنشاء حساب
                    </h1>
                    <p className="text-slate-500 text-sm">
                        ابدأ رحلتك نحو التفوق ولا تضيع الفرصة
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <Input
                        placeholder="الاسم الكامل"
                        icon={User}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="bg-white border text-slate-900 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 text-right h-12 transition-all hover:border-blue-300"
                        iconClassName="text-blue-500"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Wilaya Select */}
                        <div className="relative">
                            <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none z-10" />
                            <select
                                value={formData.wilaya}
                                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-11 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer h-12 shadow-sm hover:border-blue-300"
                            >
                                <option value="" className="text-slate-400">أي ولاية؟</option>
                                {ALGERIAN_WILAYAS.map(w => (
                                    <option key={w.id} value={w.name}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Major Select */}
                        <div className="relative">
                            <BookOpen className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none z-10" />
                            <select
                                value={formData.major}
                                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-11 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer h-12 shadow-sm hover:border-blue-300"
                            >
                                {MAJORS.map(m => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Email */}
                    <Input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        icon={Mail}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white border text-slate-900 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 text-right h-12 transition-all hover:border-blue-300"
                        iconClassName="text-blue-500"
                    />

                    {/* Password */}
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="كلمة المرور"
                            icon={Lock}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="bg-white border text-slate-900 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 text-right pl-12 h-12 transition-all hover:border-blue-300"
                            iconClassName="text-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    <Button
                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold h-12 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                        size="lg"
                        isLoading={isLoading}
                    >
                        {isLoading ? "جاري الإنشاء..." : "نحو التفوق 🚀"}
                    </Button>

                    <div className="mt-6 text-center space-y-4">
                        <Link href="/auth/login" className="text-sm text-slate-500 hover:text-blue-600 transition-colors inline-block">
                            لديك حساب بالفعل؟ <span className="font-bold text-blue-600 underline-offset-4 hover:underline">سجل دخولك</span>
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
