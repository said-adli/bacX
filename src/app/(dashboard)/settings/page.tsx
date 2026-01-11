"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-serif font-bold mb-8">الإعدادات</h1>

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
                    onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        window.location.replace('/login');
                    }}
                    className="w-full py-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all flex items-center justify-center gap-3 font-bold group cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    تسجيل الخروج
                </button>
            </GlassCard>

            <div className="flex justify-end gap-3 pt-4">
                <button className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm">إلغاء</button>
                <button className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-bold">حفظ التغييرات</button>
            </div>

        </div>
    );
}
