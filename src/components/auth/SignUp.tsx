"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveStudentData } from "@/lib/user";
import { ALGERIAN_WILAYAS } from "@/lib/data/wilayas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, MapPin, BookOpen, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SignUpProps {
    onToggleLogin: () => void;
}

export function SignUp({ onToggleLogin }: SignUpProps) {
    const router = useRouter();
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
        "شعبة تقني رياضي"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName.trim()) return toast.error("الاسم الكامل مطلوب");
        if (!formData.wilaya) return toast.error("يرجى اختيار الولاية");
        if (formData.password.length < 8) return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");

        setIsLoading(true);
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            // 2. Save Firestore Data
            await saveStudentData({
                uid: userCredential.user.uid,
                email: formData.email,
                fullName: formData.fullName,
                wilaya: formData.wilaya,
                major: formData.major
            }, { isNewUser: true });

            toast.success("تم إنشاء الحساب بنجاح! جاري التوجيه...");
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            // @ts-expect-error: error is unknown typed but we know it has code property in firebase auth
            if (error.code === 'auth/email-already-in-use') {
                toast.error("البريد الإلكتروني مستخدم بالفعل");
            } else {
                toast.error("حدث خطأ أثناء التسجيل");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
                placeholder="الاسم الكامل"
                icon={User}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-primary/50 text-right h-12 text-base rounded-2xl"
                dir="rtl"
            />

            {/* Wilaya Select */}
            <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                <select
                    value={formData.wilaya}
                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 pr-12 text-zinc-200 outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer text-base"
                    dir="rtl"
                >
                    <option value="" className="bg-[#0A0A0F] text-zinc-500">اختر الولاية...</option>
                    {ALGERIAN_WILAYAS.map(w => (
                        <option key={w.id} value={w.name} className="bg-[#0A0A0F] text-white">
                            {w.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Major Select */}
            <div className="relative">
                <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                <select
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 pr-12 text-zinc-200 outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer text-base"
                    dir="rtl"
                >
                    {MAJORS.map(m => (
                        <option key={m} value={m} className="bg-[#0A0A0F] text-white">
                            {m}
                        </option>
                    ))}
                </select>
            </div>

            {/* Email */}
            <Input
                type="email"
                placeholder="البريد الإلكتروني"
                icon={Mail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-primary/50 text-right h-12 text-base rounded-2xl"
                dir="rtl"
            />

            {/* Password */}
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="كلمة المرور"
                    icon={Lock}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/5 border-white/10 focus:border-primary/50 text-right pl-12 h-12 text-base rounded-2xl"
                    dir="rtl"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>

            <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:scale-[1.02] mt-2"
                size="lg"
                isLoading={isLoading}
            >
                {isLoading ? "جاري الإنشاء..." : "نحو التفوق 🚀"}
            </Button>

            <div className="mt-8 text-center text-sm text-slate-400">
                لديك حساب بالفعل؟{" "}
                <button
                    type="button"
                    onClick={onToggleLogin}
                    className="text-primary font-bold hover:text-primary-hover transition-colors inline-flex items-center gap-1 group"
                >
                    سجل دخولك
                    <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>
        </form>
    );
}
