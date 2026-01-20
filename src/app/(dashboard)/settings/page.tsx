"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import {
    Shield, Lock, Smartphone, Globe, Download,
    AlertTriangle, LogOut, Eye, EyeOff, LayoutGrid, Key
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const { logout, user } = useAuth();
    const [twoFactor, setTwoFactor] = useState(false);
    const [incognito, setIncognito] = useState(false);
    const [loadingExport, setLoadingExport] = useState(false);

    const handleGlobalLogout = async () => {
        // In a real app, this would call a server function to revoke all tokens.
        // For Supabase, standard logout invalidates the current session.
        toast.promise(logout(), {
            loading: "جاري تسجيل الخروج من جميع الأجهزة...",
            success: "تم الخروج بنجاح",
            error: "حدث خطأ أثناء تسجيل الخروج"
        });
    };

    const handleExportData = () => {
        setLoadingExport(true);
        setTimeout(() => {
            setLoadingExport(false);
            toast.success("تم تجهيز ملف بياناتك للتحميل");
        }, 2000);
    };

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

                {/* SECTION 1: SECURITY HUB */}
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
                                        <p className="text-sm font-bold text-white">متصفح Chrome - Windows</p>
                                        <p className="text-xs text-green-400">الجهاز الحالي • الجزائر العاصمة</p>
                                    </div>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                            </div>

                            {/* Other Device */}
                            <div className="flex items-center justify-between group opacity-60 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <Smartphone className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">iPhone 14 Pro Max</p>
                                        <p className="text-xs text-white/50">آخر نشاط: قبل 2 ساعة • سطيف</p>
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
                </div>

                {/* SECTION 2: PRIVACY & DATA */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
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
                                <button className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-xs font-bold transition-all">
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
