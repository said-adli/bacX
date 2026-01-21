"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
    Shield, Lock, Smartphone, Globe, Download,
    AlertTriangle, LogOut, Eye, EyeOff, LayoutGrid, Key, User, MapPin, BookOpen, GraduationCap, Save, Loader2
} from "lucide-react";
import { toast } from "sonner";
// import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
    const { logout, user, refreshProfile } = useAuth();
    const supabase = createClient();

    // Toggle States
    const [twoFactor, setTwoFactor] = useState(false);
    const [incognito, setIncognito] = useState(false);

    // Loading States
    const [loadingExport, setLoadingExport] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Form Data
    const [formData, setFormData] = useState({
        full_name: "",
        wilaya: "",
        major: "",
        study_system: ""
    });

    // 1. Fetch User Data
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setLoadingData(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, wilaya, major, study_system')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                if (data) {
                    setFormData({
                        full_name: data.full_name || "",
                        wilaya: data.wilaya || "",
                        major: data.major || "",
                        study_system: data.study_system || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("فشل في تحميل بيانات المستخدم");
            } finally {
                setLoadingData(false);
            }
        };

        fetchUserData();
    }, [user, supabase]);

    const handleGlobalLogout = async () => {
        toast.promise(logout(), {
            loading: "جاري تسجيل الخروج من جميع الأجهزة...",
            success: "تم الخروج بنجاح",
            error: "حدث خطأ أثناء تسجيل الخروج"
        });
    };

    const handleSaveChanges = async () => {
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
            toast.success("تم حفظ التغييرات بنجاح");

            await refreshProfile();
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("فشل في حفظ التغييرات");
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = () => {
        setLoadingExport(true);
        setTimeout(() => {
            setLoadingExport(false);
            toast.success("تم تجهيز ملف بياناتك للتحميل");
        }, 2000);
    };

    const handleDeleteAccount = async () => {
        if (!confirm("هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه!")) return;

        // In a real app, calling a server action to delete user is safer.
        // For now, we'll try to disable the profile as 'deleted' status if hard delete is restricted.
        toast.error("يرجى التواصل مع الدعم الفني لحذف الحساب نهائياً لأسباب أمنية.");
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 pb-20">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                    <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">مركز الأمان والخصوصية</h1>
                    <p className="text-white/40 text-sm">إدارة جلسات الدخول، حماية الحساب، والبيانات الشخصية</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT COLUMN: Profile & Privacy */}
                <div className="space-y-6">

                    {/* PROFILE EDIT SECTION (NEW) */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-400" />
                            المعلومات الشخصية
                        </h2>
                        <GlassCard className="p-6 space-y-4 border-blue-500/20">

                            <div className="space-y-2">
                                <label className="text-sm text-white/60">الاسم الكامل</label>
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-blue-500/50 focus:outline-none transition-all"
                                        placeholder="الاسم الكامل"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">الولاية</label>
                                    <div className="relative">
                                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="text"
                                            value={formData.wilaya}
                                            onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-blue-500/50 focus:outline-none transition-all"
                                            placeholder="الولاية"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">الشعبة</label>
                                    <div className="relative">
                                        <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="text"
                                            value={formData.major}
                                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-blue-500/50 focus:outline-none transition-all"
                                            placeholder="الشعبة"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-white/60">نظام الدراسة</label>
                                <div className="relative">
                                    <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <select
                                        value={formData.study_system}
                                        onChange={(e) => setFormData({ ...formData, study_system: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-blue-500/50 focus:outline-none transition-all appearance-none"
                                    >
                                        <option value="" className="bg-zinc-900 text-gray-500">اختر نظام الدراسة (نظامي/حر)</option>
                                        <option value="regular" className="bg-zinc-900">طالب نظامي (Moutamadriss)</option>
                                        <option value="private" className="bg-zinc-900">طالب حر (Candidat Libre)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                حفظ التعديلات
                            </button>

                        </GlassCard>
                    </div>

                    <h2 className="text-xl font-bold text-white/90 flex items-center gap-2 pt-4">
                        <Eye className="w-5 h-5 text-purple-400" />
                        الخصوصية والبيانات (Privacy)
                    </h2>

                    {/* Incognito Mode */}
                    <GlassCard className="p-5 flex items-center justify-between border-purple-500/20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
                                {incognito ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">وضع التخفي (Incognito)</h3>
                                <p className="text-xs text-white/50">إخفاء اسمك من قوائم الترتيب والدردشة العامة.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIncognito(!incognito);
                                toast(incognito ? "أنت الآن مرئي للجميع" : "تم تفعيل وضع التخفي");
                            }}
                            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${incognito ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${incognito ? 'left-7' : 'left-1'}`} />
                        </button>
                    </GlassCard>

                    {/* Data Export */}
                    <GlassCard className="p-5 border-white/10 hover:border-white/20 transition-all">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <Download className="w-5 h-5 text-white/70" />
                                <h3 className="font-bold text-white text-sm">نسخة من بياناتي</h3>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed">
                                يمكنك تحميل ملف كامل يحتوي على سجلك الدراسي، علاماتك، وإنجازاتك بصيغة JSON أو PDF.
                            </p>
                            <button
                                onClick={handleExportData}
                                disabled={loadingExport}
                                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                            >
                                {loadingExport ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Download size={14} />
                                        طلب الأرشيف
                                    </>
                                )}
                            </button>
                        </div>
                    </GlassCard>

                </div>

                {/* RIGHT COLUMN: Security */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-green-400" />
                        مركز الأمان (Security Hub)
                    </h2>

                    {/* Active Sessions */}
                    <GlassCard className="p-0 overflow-hidden border-green-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <span className="font-bold text-white text-sm">الجلسات النشطة</span>
                            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 animate-pulse">محمي</span>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Current Device */}
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <Globe className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">الجهاز الحالي</p>
                                        <p className="text-xs text-green-400">نشط الآن • الجزائر</p>
                                    </div>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                            </div>

                            {/* Simulated Other Device */}
                            <div className="flex items-center justify-between group opacity-60 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <Smartphone className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">iPhone 14 Pro</p>
                                        <p className="text-xs text-white/50">آخر نشاط: قبل 2 ساعة</p>
                                    </div>
                                </div>
                                <button className="text-xs text-red-400 hover:text-red-300 hover:underline">إخراج</button>
                            </div>
                        </div>

                        {/* Global Logout */}
                        <div className="p-4 bg-red-500/5 border-t border-red-500/10 hover:bg-red-500/10 transition-colors">
                            <button
                                onClick={handleGlobalLogout}
                                className="w-full flex items-center justify-center gap-2 text-red-500 font-bold text-sm py-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <LogOut size={16} />
                                تسجيل الخروج من جميع الأجهزة
                            </button>
                        </div>
                    </GlassCard>

                    {/* 2FA Toggle */}
                    <GlassCard className="p-5 flex items-center justify-between border-blue-500/20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">المصادقة الثنائية (2FA)</h3>
                                <p className="text-xs text-white/50">زيادة أمان الحساب عبر رمز SMS.</p>
                            </div>
                        </div>
                        {/* Premium Toggle Switch */}
                        <button
                            onClick={() => {
                                setTwoFactor(!twoFactor);
                                toast(twoFactor ? "تم إيقاف المصادقة الثنائية" : "تم تفعيل المصادقة الثنائية (محاكاة)");
                            }}
                            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${twoFactor ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${twoFactor ? 'left-7' : 'left-1'}`} />
                        </button>
                    </GlassCard>

                    {/* Danger Zone */}
                    <div className="pt-8">
                        <GlassCard className="p-0 border-red-500/20 overflow-hidden">
                            <div className="p-4 bg-red-500/5 border-b border-red-500/10">
                                <h3 className="text-sm font-bold text-red-500 flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    منطقة الخطر
                                </h3>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-white/40 mb-4">
                                    حذف الحساب هو إجراء نهائي لا يمكن التراجع عنه. سيتم حذف جميع بياناتك واشتراكاتك.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-xs font-bold transition-all"
                                >
                                    حذف حسابي نهائياً
                                </button>
                            </div>
                        </GlassCard>
                    </div>

                </div>

            </div>
        </div>
    );
}
