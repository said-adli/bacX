"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { User, MapPin, Save, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { SmartButton } from "@/components/ui/SmartButton";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileFormSkeleton from "@/components/ui/skeletons/ProfileFormSkeleton";

export function EditProfileClient() {
    const { user } = useAuth();
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        full_name: "",
        wilaya: "",
        major: "",
        study_system: ""
    });

    // 1. Fetch Profile Data
    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            if (!user) {
                if (mounted) setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, wilaya, major, study_system')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data && mounted) {
                    setFormData({
                        full_name: data.full_name || "",
                        wilaya: data.wilaya || "",
                        major: data.major || "",
                        study_system: data.study_system || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("فشل في تحميل بيانات الملف الشخصي");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchProfile();
        return () => { mounted = false; };
    }, [user, supabase]);

    // 2. Handle Save
    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    wilaya: formData.wilaya,
                    major: formData.major,
                    study_system: formData.study_system,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("تم تحديث المعلومات بنجاح");
            router.push('/profile');
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("حدث خطأ أثناء الحفظ");
            setSaving(false);
        }
    };

    if (loading) {
        return <ProfileFormSkeleton />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <div className="flex items-center gap-4 mb-2">
                <Link
                    href="/settings"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    <ChevronRight size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white">تعديل الملف الشخصي</h1>
                    <p className="text-white/40">قم بتحديث معلوماتك الشخصية</p>
                </div>
            </div>

            <GlassCard className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-white/60 mr-1">الاسم الكامل</label>
                        <Input
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            icon={User}
                            placeholder="الاسم الكامل"
                            className="bg-white/5 border-white/10 focus:border-blue-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-white/60 mr-1">الولاية</label>
                        <Input
                            value={formData.wilaya}
                            onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                            icon={MapPin}
                            placeholder="الولاية"
                            className="bg-white/5 border-white/10 focus:border-blue-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-white/60 mr-1">الشعبة</label>
                        <Input
                            value={formData.major}
                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                            icon={BookOpen}
                            placeholder="مثال: علوم تجريبية"
                            className="bg-white/5 border-white/10 focus:border-blue-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-white/60 mr-1">نظام الدراسة</label>
                        <div className="relative">
                            <select
                                value={formData.study_system}
                                onChange={(e) => setFormData({ ...formData, study_system: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-[10px] pl-4 text-white appearance-none focus:border-blue-500/50 focus:outline-none"
                                dir="rtl"
                            >
                                <option value="" className="bg-[#0F0F12]">اختر نظام الدراسة</option>
                                <option value="regular" className="bg-[#0F0F12]">طالب نظامي</option>
                                <option value="private" className="bg-[#0F0F12]">طالب حر</option>
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="sticky bottom-6 flex justify-end bg-black/80 md:backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50">
                <SmartButton
                    onClick={handleSave}
                    isLoading={saving}
                    disabled={saving}
                    pendingText="جاري الحفظ..."
                    className="w-auto px-8 !h-12 !rounded-xl !bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-500 hover:!to-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all outline-none border-0"
                >
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                </SmartButton>
            </div>
        </div>
    );
}
