"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { LogOut, User, Phone, MapPin, Loader2, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/Input"; // Assuming reusable Input component exists
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { user, logout } = useAuth(); // Use context logout initially, but we might override for strictness
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        wilaya: ""
    });

    // 1. Fetch Profile Data on Load
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, phone, wilaya')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setFormData({
                        full_name: data.full_name || "",
                        phone: data.phone || "",
                        wilaya: data.wilaya || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("فشل في تحميل بيانات الملف الشخصي");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
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
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("تم حفظ التغييرات بنجاح", {
                style: {
                    background: "rgba(37, 99, 235, 0.2)",
                    borderColor: "rgba(37, 99, 235, 0.5)",
                    color: "white",
                    boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)"
                }
            });

        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
        }
    };

    // 3. Strict Logout Logic
    const handleStrictLogout = async () => {
        try {
            await supabase.auth.signOut();
            window.location.replace('/login');
        } catch (error) {
            console.error("Logout error:", error);
            window.location.replace('/login');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <h1 className="text-3xl font-serif font-bold mb-8">الإعدادات</h1>

            {/* 1. PERSONAL INFORMATION (New Section) */}
            <GlassCard className="p-6 space-y-6">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    الملف الشخصي
                </h3>

                <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-sm text-white/60 mr-1">الاسم الكامل</label>
                        <Input
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            icon={User}
                            placeholder="الاسم الكامل"
                            className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
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
                            className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                        />
                    </div>

                    {/* Wilaya (Text input for now to match request simplicity, or could be select) */}
                    <div className="space-y-2">
                        <label className="text-sm text-white/60 mr-1">الولاية</label>
                        <Input
                            value={formData.wilaya}
                            onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                            icon={MapPin}
                            placeholder="الولاية"
                            className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                حفظ التغييرات
                            </>
                        )}
                    </button>
                </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-6">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4">تفضيلات المظهر</h3>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">الوضع الليلي الهادئ</p>
                        <p className="text-xs text-white/40">تفعيل الخلفية المتدرجة المهدئة للأعصاب</p>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-blue-600 p-1 flex items-center justify-end cursor-pointer">
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </div>
                </div>

                <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div>
                        <p className="font-medium">تقليل الانيميشن</p>
                        <p className="text-xs text-white/40">لتحسين الأداء على الأجهزة الضعيفة</p>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-white/10 p-1 flex items-center justify-start">
                        <div className="w-4 h-4 rounded-full bg-white/50" />
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-6">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4">الإشعارات</h3>
                <div className="space-y-4">
                    {["تنبيهات الحصص المباشرة", "رسائل المجتمع", "تحديثات المواد"].map((label, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" />
                            <span className="text-sm">{label}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Account Actions Section */}
            <GlassCard className="p-6 space-y-6 border-red-500/20">
                <h3 className="text-xl font-bold border-b border-white/10 pb-4 text-red-400">إجراءات الحساب</h3>
                <button
                    onClick={handleStrictLogout}
                    className="w-full py-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all flex items-center justify-center gap-3 font-bold group cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] relative z-50"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    تسجيل الخروج
                </button>
            </GlassCard>

        </div>
    );
}
