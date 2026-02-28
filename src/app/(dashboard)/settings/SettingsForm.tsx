"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { createClient } from "@/utils/supabase/client";
import {
    Shield, Key, Loader2, Settings, Bell, Smartphone,
    LogOut, Monitor, Clock, Mail, Globe, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { SmartButton } from "@/components/ui/SmartButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { getActiveSessions, deleteOtherSessions, type SessionRecord } from "@/actions/sessions";
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal";

// Password Change Schema
const passwordSchema = z.object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z.string().min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface SettingsFormProps {
    initialEmailPrefs: boolean;
}

export default function SettingsForm({ initialEmailPrefs }: SettingsFormProps) {
    const { user } = useAuth();
    const supabase = createClient();

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState(initialEmailPrefs);
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Real Session Data
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    // Fetch real sessions from DB
    const fetchSessions = useCallback(async () => {
        setIsLoadingSessions(true);
        try {
            const result = await getActiveSessions();
            setSessions(result.sessions);
            setCurrentToken(result.currentToken);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
        } finally {
            setIsLoadingSessions(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const onPasswordSubmit = async (values: PasswordFormValues) => {
        setIsChangingPassword(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: values.currentPassword
            });

            if (signInError) {
                toast.error("كلمة المرور الحالية غير صحيحة");
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: values.newPassword
            });

            if (updateError) throw updateError;

            toast.success("تم تغيير كلمة المرور بنجاح");
            passwordForm.reset();
        } catch (error) {
            console.error("Password change error:", error);
            toast.error("حدث خطأ أثناء تغيير كلمة المرور");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSignOutOtherDevices = async () => {
        setIsSigningOutOthers(true);
        try {
            // 1. Sign out other Supabase sessions
            const { error } = await supabase.auth.signOut({ scope: "others" });
            if (error) throw error;

            // 2. Clean up DB records
            const result = await deleteOtherSessions();
            if (!result.success) throw new Error(result.error);

            toast.success("تم تسجيل الخروج من جميع الأجهزة الأخرى");

            // 3. Refresh the session list
            await fetchSessions();
        } catch (error) {
            console.error(error);
            toast.error("فشلت العملية");
        } finally {
            setIsSigningOutOthers(false);
        }
    };

    const handleEmailToggle = async () => {
        if (!user) return;
        const previousValue = notifyEmail;
        const newValue = !notifyEmail;

        setNotifyEmail(newValue);
        setIsSavingEmail(true);

        try {
            const { error } = await supabase
                .from("profiles")
                .update({ email_notifications: newValue, updated_at: new Date().toISOString() })
                .eq("id", user.id);

            if (error) throw error;
            toast.success(newValue ? "تم تفعيل الإشعارات" : "تم إيقاف الإشعارات");
        } catch {
            setNotifyEmail(previousValue);
            toast.error("فشل حفظ التغيير");
        } finally {
            setIsSavingEmail(false);
        }
    };

    // Format relative time
    const formatLastActive = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return "نشط الآن";
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        const diffDays = Math.floor(diffHours / 24);
        return `منذ ${diffDays} يوم`;
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <Settings className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">إعدادات الحساب</h1>
                    <p className="text-white/40 text-sm">إدارة الأمان والإشعارات</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Password */}
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Key className="text-yellow-400" size={20} />
                            تغيير كلمة المرور
                        </h2>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">كلمة المرور الحالية</label>
                                <input {...passwordForm.register("currentPassword")} type="password" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">كلمة المرور الجديدة</label>
                                <input {...passwordForm.register("newPassword")} type="password" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">تأكيد كلمة المرور</label>
                                <input {...passwordForm.register("confirmPassword")} type="password" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50" />
                            </div>
                            <SmartButton isLoading={isChangingPassword} type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold shadow-lg">تعيين كلمة المرور</SmartButton>
                        </form>
                    </GlassCard>

                    {/* Active Sessions — Real Data */}
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Smartphone className="text-purple-400" size={20} />
                            الجلسات النشطة
                            {!isLoadingSessions && sessions.length > 0 && (
                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                                    {sessions.length}
                                </span>
                            )}
                        </h2>

                        {isLoadingSessions ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                                <span className="text-white/40 text-sm mr-2">جاري التحميل...</span>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-6 text-white/40 text-sm">
                                لا توجد جلسات نشطة
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessions.map((session) => {
                                    const isCurrent = session.session_token === currentToken;
                                    return (
                                        <div
                                            key={session.id}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isCurrent
                                                    ? "bg-green-500/5 border-green-500/20"
                                                    : "bg-white/5 border-white/10"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent ? "bg-green-500/20" : "bg-white/10"
                                                    }`}>
                                                    <Monitor className={`w-5 h-5 ${isCurrent ? "text-green-400" : "text-white/40"}`} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">{session.terminal_info}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-white/40 text-xs flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {isCurrent ? "نشط الآن" : formatLastActive(session.last_active)}
                                                        </p>
                                                        {session.ip_address && (
                                                            <p className="text-white/30 text-xs flex items-center gap-1">
                                                                <Globe className="w-3 h-3" />
                                                                {session.ip_address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {isCurrent && (
                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 shrink-0">
                                                    الجلسة الحالية
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {sessions.length > 1 && (
                            <SmartButton
                                isLoading={isSigningOutOthers}
                                onClick={handleSignOutOtherDevices}
                                className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl font-bold"
                            >
                                <LogOut className="w-4 h-4 ml-2" />
                                تسجيل الخروج من الأجهزة الأخرى
                            </SmartButton>
                        )}
                    </GlassCard>

                    {/* Notifications */}
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Bell className="text-blue-400" size={20} />
                            تفضيلات الإشعارات
                        </h2>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">إشعارات البريد الإلكتروني</p>
                                    <p className="text-white/40 text-xs">استلام التحديثات عبر البريد</p>
                                </div>
                            </div>
                            <button
                                onClick={handleEmailToggle}
                                disabled={isSavingEmail}
                                className={`relative w-12 h-6 rounded-full transition-colors ${notifyEmail ? "bg-blue-600" : "bg-white/20"}`}
                            >
                                {isSavingEmail ? <Loader2 className="w-3 h-3 text-white absolute top-1.5 left-1/2 -translate-x-1/2 animate-spin" /> :
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifyEmail ? "right-1" : "left-1"}`} />}
                            </button>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <GlassCard className="p-6 border-white/10 bg-blue-600/5">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400" /> نصائح أمنية</h3>
                        <ul className="text-sm text-white/60 space-y-2">
                            <li>• استخدم كلمة مرور قوية</li>
                            <li>• تحقق من الجلسات بانتظام</li>
                        </ul>
                    </GlassCard>

                    {/* Delete Account — Danger Zone */}
                    <GlassCard className="p-6 border-red-500/20 bg-red-600/5">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-400" />
                            منطقة الخطر
                        </h3>
                        <p className="text-white/40 text-xs mb-4">حذف الحساب بشكل نهائي ولا يمكن التراجع عنه.</p>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full px-4 py-3 rounded-xl border border-red-500/30 bg-red-600/10 hover:bg-red-600/20 text-red-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            حذف الحساب
                        </button>
                    </GlassCard>
                </div>
            </div>

            {/* Account Deletion Modal */}
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
}
