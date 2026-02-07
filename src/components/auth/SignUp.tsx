"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, MapPin, BookOpen, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface SignUpProps {
    onToggleLogin: () => void;
}

export function SignUp({ onToggleLogin }: SignUpProps) {
    const { signupWithEmail } = useAuth();


    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        wilaya: "",
        major: ""
    });

    // Dynamic Data State
    const [wilayas, setWilayas] = useState<{ id: string, name: string }[]>([]);
    const [majors, setMajors] = useState<{ id: string, name: string }[]>([]);

    // Fetch Static Data on Mount
    useEffect(() => {
        const loadStaticData = async () => {
            try {
                // Parallel fetch for speed
                const [wList, mList] = await Promise.all([
                    import("@/actions/static-data").then(mod => mod.getWilayas()),
                    import("@/actions/static-data").then(mod => mod.getMajors())
                ]);
                setWilayas(wList);
                setMajors(mList);

                // Set default major if list available and no major selected
                if (mList.length > 0) {
                    setFormData(prev => {
                        if (!prev.major) return { ...prev, major: mList[0].name };
                        return prev;
                    });
                }
            } catch (error) {
                console.error("Failed to load static data", error);
                toast.error("Could not load form data options");
            }
        };
        loadStaticData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName.trim()) return toast.error("الاسم الكامل مطلوب");
        if (!formData.wilaya) return toast.error("يرجى اختيار الولاية");
        if (formData.password.length < 8) return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
        if (!formData.major) return toast.error("يرجى اختيار الشعبة");

        setIsLoading(true);
        try {
            // ATOMIC: Creates Auth User + Firestore Profile in one operation
            await signupWithEmail({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                wilaya: formData.wilaya,
                major: formData.major
            });

            toast.success("تم إنشاء الحساب بنجاح! جاري التوجيه...");
            // Redirect to dashboard (state is already set in context)
            router.replace("/dashboard");
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "";
            if (errorMessage.includes('auth/email-already-in-use')) {
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
                    {wilayas.map(w => (
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
                    <option value="" className="bg-[#0A0A0F] text-zinc-500">اختر الشعبة...</option>
                    {majors.map(m => (
                        <option key={m.id} value={m.name} className="bg-[#0A0A0F] text-white">
                            {m.name}
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
