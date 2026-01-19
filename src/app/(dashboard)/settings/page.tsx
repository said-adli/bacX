"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { LogOut, Loader2, Save, Moon, Bell, CreditCard, Monitor } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserPreferences {
    theme: 'dark' | 'light';
    notifications: {
        live: boolean;
        community: boolean;
        materials: boolean;
    };
    video_quality: 'auto' | '720p' | '1080p';
}

export default function SettingsPage() {
    const { user, profile, logout } = useAuth();
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: 'dark',
        notifications: { live: true, community: true, materials: true },
        video_quality: 'auto'
    });

    // 1. Fetch Preferences on Load
    useEffect(() => {
        let mounted = true;
        const fetchPreferences = async () => {
            console.log("SettingsPage: Fetching preferences started...");

            if (!user) {
                console.log("SettingsPage: No user found. Stopping spinner.");
                if (mounted) setLoading(false);
                return;
            }

            try {
                console.log("SettingsPage: Fetching for User ID:", user.id);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('preferences')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error("SettingsPage: Supabase query error:", error);
                    throw error;
                }

                console.log("SettingsPage: Data received:", data);

                if (data && data.preferences && mounted) {
                    setPreferences(data.preferences as UserPreferences);
                }
            } catch (error) {
                console.error("SettingsPage: Error fetching preferences:", error);
                toast.error("فشل في تحميل التفضيلات");
            } finally {
                if (mounted) {
                    console.log("SettingsPage: Loading finished.");
                    setLoading(false);
                }
            }
        };

        fetchPreferences();

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
                    preferences: preferences,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("تم حفظ التغييرات بنجاح");

        } catch (error) {
            console.error("Error updating preferences:", error);
            toast.error("حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">إعدادات التطبيق</h1>

            <div className="space-y-6">

                {/* Preferences */}
                <GlassCard className="p-8 space-y-6">
                    <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-purple-300">
                        <Monitor className="w-5 h-5" />
                        التفضيلات
                    </h3>

                    {/* Theme */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-lg"><Moon className="w-4 h-4 text-purple-400" /></div>
                            <div>
                                <p className="font-bold">المظهر الداكن</p>
                                <p className="text-xs text-white/40">تفعيل الوضع الليلي لواجهة التطبيق</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setPreferences(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
                            className={cn("w-12 h-6 rounded-full p-1 cursor-pointer transition-colors", preferences.theme === 'dark' ? "bg-purple-600 justify-end flex" : "bg-white/10 justify-start flex")}
                        >
                            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </div>
                    </div>

                    {/* Video Quality */}
                    <div className="flex items-center justify-between py-2 border-t border-white/5 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-lg"><Monitor className="w-4 h-4 text-blue-400" /></div>
                            <div>
                                <p className="font-bold">جودة الفيديو الافتراضية</p>
                                <p className="text-xs text-white/40">الجودة المفضلة عند تشغيل الدروس</p>
                            </div>
                        </div>
                        <select
                            value={preferences.video_quality}
                            onChange={(e) => setPreferences({ ...preferences, video_quality: e.target.value as any })}
                            className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="auto">تلقائي (Auto)</option>
                            <option value="720p">HD 720p</option>
                            <option value="1080p">FHD 1080p</option>
                        </select>
                    </div>
                </GlassCard>

                {/* Notifications */}
                <GlassCard className="p-8 space-y-6">
                    <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-green-300">
                        <Bell className="w-5 h-5" />
                        الإشعارات
                    </h3>
                    <div className="space-y-4">
                        {[
                            { key: 'live', label: 'تنبيهات الحصص المباشرة' },
                            { key: 'community', label: 'رسائل المجتمع' },
                            { key: 'materials', label: 'تحديثات المواد والدروس' }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                                <span className="text-sm font-medium">{item.label}</span>
                                <input
                                    type="checkbox"
                                    checked={preferences.notifications[item.key as keyof typeof preferences.notifications]}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        notifications: { ...preferences.notifications, [item.key]: e.target.checked }
                                    })}
                                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                                />
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Subscription Info */}
                <GlassCard className="p-8 space-y-6 border-blue-500/20 bg-blue-900/5">
                    <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2 text-blue-300">
                        <CreditCard className="w-5 h-5" />
                        الاشتراك
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60 mb-1">نوع الاشتراك الحالي</p>
                            <p className="text-2xl font-bold text-white tracking-wider">
                                {profile?.is_subscribed ? "PROFESSIONAL" : "مجاني Free"}
                            </p>
                        </div>
                        {profile?.is_subscribed ? (
                            <div className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full text-xs font-bold">
                                نشط
                            </div>
                        ) : (
                            <button onClick={() => router.push('/subscription')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20">
                                ترقية الحساب
                            </button>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* SAVE BAR */}
            <div className="sticky bottom-6 flex items-center justify-between bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50">
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-bold"
                >
                    <LogOut size={18} />
                    تسجيل الخروج
                </button>

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
