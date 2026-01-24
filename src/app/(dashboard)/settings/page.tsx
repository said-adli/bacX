"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
    Shield, User, MapPin, BookOpen, GraduationCap,
    Save, Loader2, Phone, FileText, Settings
} from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { SmartButton } from "@/components/ui/SmartButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Algerian Wilayas List (Simplified)
const WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
    "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane", "El M'Ghair", "El Meniaa", "Ouled Djellal", "Bordj Baji Mokhtar",
    "Béni Abbès", "Timimoun", "Touggourt", "Djanet", "In Salah", "In Guezzam"
];

// Validation Schema
const profileSchema = z.object({
    full_name: z.string().min(3, "الاسم الكامل مطلوب (على الأقل 3 أحرف)"),
    phone: z.string().min(10, "رقم الهاتف غير صالح").optional().or(z.literal("")),
    wilaya: z.string().min(1, "يرجى اختيار الولاية"),
    major: z.string().min(1, "يرجى اختيار الشعبة").optional().or(z.literal("")),
    study_system: z.string().optional(),
    bio: z.string().max(250, "النبذة طويلة جداً").optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: "",
            phone: "",
            wilaya: "",
            major: "",
            study_system: "",
            bio: ""
        }
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = form;

    // Fetch latest fresh data on mount
    useEffect(() => {
        const fetchLatest = async () => {
            if (!user) return;
            const supabase = createClient();
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                reset({
                    full_name: data.full_name || "",
                    wilaya: data.wilaya || "",
                    major: data.major || "",
                    study_system: data.study_system || "",
                    phone: data.phone_number || "",
                    bio: data.bio || ""
                });
            }
            setIsLoading(false);
        };
        fetchLatest();
    }, [user, reset]);

    const onSubmit = async (values: ProfileFormValues) => {
        const formData = new FormData();
        formData.append("full_name", values.full_name);
        formData.append("wilaya", values.wilaya);
        formData.append("major", values.major || "");
        formData.append("study_system", values.study_system || "");
        formData.append("phone", values.phone || "");
        formData.append("bio", values.bio || "");

        const result = await updateProfile(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
        }
    };

    if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-white/30" /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <Settings className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">إعدادات الحساب</h1>
                    <p className="text-white/40 text-sm">قم بتحديث معلوماتك الشخصية والدراسية</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <User className="text-blue-400" size={20} />
                            البيانات الشخصية
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">الاسم الكامل</label>
                                <div className="relative">
                                    <input
                                        {...register("full_name")}
                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 pl-10 text-white focus:outline-none transition-all ${errors.full_name ? "border-red-500" : "border-white/10 focus:border-blue-500/50"}`}
                                        placeholder="الاسم واللقب"
                                    />
                                    <User className="absolute left-3 top-3.5 text-white/20 w-4 h-4" />
                                </div>
                                {errors.full_name && <p className="text-red-400 text-xs">{errors.full_name.message}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">رقم الهاتف</label>
                                <div className="relative">
                                    <input
                                        {...register("phone")}
                                        type="tel"
                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 pl-10 text-white focus:outline-none transition-all ${errors.phone ? "border-red-500" : "border-white/10 focus:border-blue-500/50"}`}
                                        dir="ltr"
                                        placeholder="05 50 ..."
                                    />
                                    <Phone className="absolute left-3 top-3.5 text-white/20 w-4 h-4" />
                                </div>
                                {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-sm text-white/60">نبذة تعريفية</label>
                            <div className="relative">
                                <textarea
                                    {...register("bio")}
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 pl-10 text-white focus:outline-none transition-all min-h-[100px] ${errors.bio ? "border-red-500" : "border-white/10 focus:border-blue-500/50"}`}
                                    placeholder="اكتب شيئاً عن نفسك..."
                                />
                                <FileText className="absolute left-3 top-3.5 text-white/20 w-4 h-4" />
                            </div>
                            {errors.bio && <p className="text-red-400 text-xs">{errors.bio.message}</p>}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <GraduationCap className="text-purple-400" size={20} />
                            المعلومات الدراسية
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Wilaya */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">الولاية</label>
                                <div className="relative">
                                    <select
                                        {...register("wilaya")}
                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white appearance-none focus:outline-none transition-all ${errors.wilaya ? "border-red-500" : "border-white/10 focus:border-purple-500/50"}`}
                                    >
                                        <option value="">اختر الولاية</option>
                                        {WILAYAS.map((w) => (
                                            <option key={w} value={w} className="bg-zinc-900">{w}</option>
                                        ))}
                                    </select>
                                    <MapPin className="absolute left-3 top-3.5 text-white/20 w-4 h-4" />
                                </div>
                                {errors.wilaya && <p className="text-red-400 text-xs">{errors.wilaya.message}</p>}
                            </div>

                            {/* Major */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">الشعبة</label>
                                <div className="relative">
                                    <select
                                        {...register("major")}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500/50 transition-all"
                                    >
                                        <option value="">اختر الشعبة</option>
                                        <option value="science" className="bg-zinc-900">علوم تجريبية</option>
                                        <option value="math" className="bg-zinc-900">رياضيات</option>
                                        <option value="tech" className="bg-zinc-900">تقني رياضي</option>
                                        <option value="gest" className="bg-zinc-900">تسيير واقتصاد</option>
                                        <option value="letter" className="bg-zinc-900">آداب وفلسفة</option>
                                        <option value="lang" className="bg-zinc-900">لغات أجنبية</option>
                                    </select>
                                    <BookOpen className="absolute left-3 top-3.5 text-white/20 w-4 h-4" />
                                </div>
                            </div>

                            {/* Study System */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">نظام الدراسة</label>
                                <div className="relative">
                                    <select
                                        {...register("study_system")}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500/50 transition-all"
                                    >
                                        <option value="">اختر النظام</option>
                                        <option value="regular" className="bg-zinc-900">طالب نظامي (متمدرس)</option>
                                        <option value="private" className="bg-zinc-900">طالب حر (Libre)</option>
                                    </select>
                                    <GraduationCap className="absolute left-3 top-3.5 text-white/20 w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="flex justify-end pt-4">
                        <SmartButton
                            isLoading={isSubmitting}
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20"
                        >
                            <Save className="w-5 h-5 ml-2" />
                            حفظ التغييرات
                        </SmartButton>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <GlassCard className="p-6 border-white/10 bg-blue-600/5">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-400" />
                            أمان الحساب
                        </h3>
                        <p className="text-sm text-white/60 mb-4">
                            كلمة المرور وحماية 2FA تدار من صفحة الأمان المخصصة.
                        </p>
                        <button type="button" className="text-xs text-blue-400 hover:text-white underline transition-colors">
                            إدارة كلمة المرور
                        </button>
                    </GlassCard>
                </div>

            </form>
        </div>
    );
}
