"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { User, Phone, MapPin, Loader2, Save, BookOpen, Shield, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user } = useAuth();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        wilaya: "",
        major: "",
        study_system: ""
    });

    // 1. Fetch Profile Data
    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            console.log("ProfilePage: Fetching profile started...");

            // Only set loading true if we are actually going to fetch
            // But initial state is true, so we just need to ensure it turns false.

            if (!user) {
                console.log("ProfilePage: No user found in AuthContext. Stopping spinner.");
                if (mounted) setLoading(false);
                return;
            }

            try {
                console.log("ProfilePage: Fetching for User ID:", user.id);
                // We use try/catch for the query specifically to handle missing columns gracefully if needed
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, phone, wilaya, major, study_system') // Query explicitly
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error("ProfilePage: Supabase query error:", error);
                    throw error;
                }

                console.log("ProfilePage: Data received:", data);

                if (data && mounted) {
                    setFormData({
                        full_name: data.full_name || "",
                        phone: data.phone || "",
                        wilaya: data.wilaya || "",
                        major: data.major || "",
                        study_system: data.study_system || ""
                    });
                }
            } catch (error) {
                console.error("ProfilePage: detailed error:", error);

                // Fallback: If study_system is missing from DB, we might get an error.
                // We can choose to ignore it or mock it, but for now we show toast.
                toast.error("فشل في تحميل بيانات الملف الشخصي");
            } finally {
                if (mounted) {
                    console.log("ProfilePage: Loading finished.");
                    setLoading(false);
                }
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
                    phone: formData.phone,
                    wilaya: formData.wilaya,
                    major: formData.major,
                    study_system: formData.study_system,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("تم حفظ الملف الشخصي بنجاح");

        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (error) toast.error(error.message);
        else toast.success("تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">الملف الشخصي</h1>

            <div className="space-y-6">
                <GlassCard className="p-8 space-y-8">
                    <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-blue-300">
                        <User className="w-5 h-5" />
                        المعلومات الشخصية
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
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

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm text-white/60 mr-1">رقم الهاتف</label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                icon={Phone}
                                placeholder="رقم الهاتف"
                                type="tel"
                                className="bg-white/5 border-white/10 focus:border-blue-500/50"
                            />
                        </div>

                        {/* Wilaya */}
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

                        {/* Branch / Major */}
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

                        {/* Study System */}
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

                {/* Security Section */}
                <GlassCard className="p-8 space-y-6 border-yellow-500/20">
                    <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-yellow-300">
                        <Shield className="w-5 h-5" />
                        الأمان
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-white">كلمة المرور</p>
                            <p className="text-sm text-white/40">تغيير كلمة المرور الخاصة بحسابك</p>
                        </div>
                        <button
                            onClick={handlePasswordReset}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
                        >
                            إرسال رابط التغيير
                        </button>
                    </div>
                </GlassCard>
            </div>

            {/* SAVE BUTTON */}
            <div className="sticky bottom-6 flex justify-end bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            حفظ التغييرات
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
