"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
    Shield, Key, Loader2, Settings, Bell, Smartphone,
    LogOut, Monitor, Clock, Mail, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { SmartButton } from "@/components/ui/SmartButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

export default function SettingsPage() {
    const { user, profile, logout } = useAuth();
    const supabase = createClient();

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);

    // Notification States (local for now, will sync with DB)
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifySms, setNotifySms] = useState(false);
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    // --- CHANGE PASSWORD ---
    const onPasswordSubmit = async (values: PasswordFormValues) => {
        setIsChangingPassword(true);
        try {
            // First, verify current password by re-authenticating
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: values.currentPassword
            });

            if (signInError) {
                toast.error("كلمة المرور الحالية غير صحيحة");
                return;
            }

            // Update to new password
            const { error: updateError } = await supabase.auth.updateUser({
                password: values.newPassword
            });

            if (updateError) {
                toast.error("حدث خطأ أثناء تغيير كلمة المرور");
                console.error(updateError);
                return;
            }

            toast.success("تم تغيير كلمة المرور بنجاح");
            passwordForm.reset();
        } catch (error) {
            console.error("Password change error:", error);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsChangingPassword(false);
        }
    };

    // --- SIGN OUT OTHER DEVICES ---
    const handleSignOutOtherDevices = async () => {
        setIsSigningOutOthers(true);
        try {
            // Sign out all sessions except current
            // This requires re-authentication for security
            const { error } = await supabase.auth.signOut({ scope: "others" });

            if (error) {
                toast.error("حدث خطأ أثناء تسجيل الخروج من الأجهزة الأخرى");
                console.error(error);
                return;
            }

            toast.success("تم تسجيل الخروج من جميع الأجهزة الأخرى");
        } catch (error) {
            console.error("Sign out others error:", error);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsSigningOutOthers(false);
        }
    };

    // --- SAVE NOTIFICATION PREFERENCES ---
    const handleSaveNotifications = async () => {
        if (!user) return;

        setIsSavingNotifications(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    notify_email: notifyEmail,
                    notify_sms: notifySms,
                    updated_at: new Date().toISOString()
                })
                .eq("id", user.id);

            if (error) {
                toast.error("حدث خطأ أثناء حفظ التفضيلات");
                console.error(error);
                return;
            }

            toast.success("تم حفظ تفضيلات الإشعارات");
        } catch (error) {
            console.error("Save notifications error:", error);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsSavingNotifications(false);
        }
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

                    {/* Password Change Section */}
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Key className="text-yellow-400" size={20} />
                            تغيير كلمة المرور
                        </h2>

                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-white/60">كلمة المرور الحالية</label>
                                <input
                                    {...passwordForm.register("currentPassword")}
                                    type="password"
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${passwordForm.formState.errors.currentPassword ? "border-red-500" : "border-white/10 focus:border-yellow-500/50"}`}
                                    placeholder="••••••••"
                                />
                                {passwordForm.formState.errors.currentPassword && (
                                    <p className="text-red-400 text-xs">{passwordForm.formState.errors.currentPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-white/60">كلمة المرور الجديدة</label>
                                <input
                                    {...passwordForm.register("newPassword")}
                                    type="password"
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${passwordForm.formState.errors.newPassword ? "border-red-500" : "border-white/10 focus:border-yellow-500/50"}`}
                                    placeholder="••••••••"
                                />
                                {passwordForm.formState.errors.newPassword && (
                                    <p className="text-red-400 text-xs">{passwordForm.formState.errors.newPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-white/60">تأكيد كلمة المرور الجديدة</label>
                                <input
                                    {...passwordForm.register("confirmPassword")}
                                    type="password"
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${passwordForm.formState.errors.confirmPassword ? "border-red-500" : "border-white/10 focus:border-yellow-500/50"}`}
                                    placeholder="••••••••"
                                />
                                {passwordForm.formState.errors.confirmPassword && (
                                    <p className="text-red-400 text-xs">{passwordForm.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <SmartButton
                                isLoading={isChangingPassword}
                                type="submit"
                                className="bg-yellow-600 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold shadow-lg"
                            >
                                <Key className="w-4 h-4 ml-2" />
                                تغيير كلمة المرور
                            </SmartButton>
                        </form>
                    </GlassCard>

                    {/* Active Sessions Section */}
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Smartphone className="text-purple-400" size={20} />
                            الجلسات النشطة
                        </h2>

                        <div className="space-y-4">
                            {/* Current Session */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Monitor className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">هذا الجهاز</p>
                                        <p className="text-white/40 text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            نشط الآن
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                    الجلسة الحالية
                                </span>
                            </div>

                            <p className="text-white/50 text-sm">
                                إذا كنت تشك في أن حسابك قد تم استخدامه من جهاز آخر، يمكنك تسجيل الخروج من جميع الأجهزة الأخرى.
                            </p>

                            <SmartButton
                                isLoading={isSigningOutOthers}
                                onClick={handleSignOutOtherDevices}
                                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl font-bold"
                            >
                                <LogOut className="w-4 h-4 ml-2" />
                                تسجيل الخروج من الأجهزة الأخرى
                            </SmartButton>
                        </div>
                    </GlassCard>

                    {/* Notification Preferences */}
                    <GlassCard className="p-6 space-y-6 border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Bell className="text-blue-400" size={20} />
                            تفضيلات الإشعارات
                        </h2>

                        <div className="space-y-4">
                            {/* Email Toggle */}
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
                                    onClick={() => setNotifyEmail(!notifyEmail)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${notifyEmail ? "bg-blue-600" : "bg-white/20"}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifyEmail ? "right-1" : "left-1"}`} />
                                </button>
                            </div>

                            {/* SMS Toggle */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">إشعارات SMS</p>
                                        <p className="text-white/40 text-xs">استلام التنبيهات العاجلة عبر الرسائل</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNotifySms(!notifySms)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${notifySms ? "bg-green-600" : "bg-white/20"}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifySms ? "right-1" : "left-1"}`} />
                                </button>
                            </div>

                            <SmartButton
                                isLoading={isSavingNotifications}
                                onClick={handleSaveNotifications}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                            >
                                <Bell className="w-4 h-4 ml-2" />
                                حفظ تفضيلات الإشعارات
                            </SmartButton>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <GlassCard className="p-6 border-white/10 bg-blue-600/5">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-400" />
                            نصائح أمنية
                        </h3>
                        <ul className="text-sm text-white/60 space-y-2">
                            <li>• استخدم كلمة مرور قوية ومختلفة</li>
                            <li>• لا تشارك بيانات الدخول مع أحد</li>
                            <li>• تحقق من الجلسات النشطة بانتظام</li>
                            <li>• قم بتسجيل الخروج عند استخدام أجهزة عامة</li>
                        </ul>
                    </GlassCard>

                    <GlassCard className="p-6 border-white/10 bg-red-600/5">
                        <h3 className="text-lg font-bold text-white mb-2">حذف الحساب</h3>
                        <p className="text-sm text-white/60 mb-4">
                            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.
                        </p>
                        <button className="text-xs text-red-400 hover:text-red-300 underline transition-colors">
                            طلب حذف الحساب
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
