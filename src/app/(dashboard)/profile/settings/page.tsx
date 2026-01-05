"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
// import { updateProfile, updatePassword } from "firebase/auth";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { User, Lock, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { user, profile } = useAuth();
    // Default to metadata or profile
    const [name, setName] = useState(user?.user_metadata?.full_name || profile?.full_name || "");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (user && name !== (user.user_metadata?.full_name || profile?.full_name)) {
                // Update Supabase Auth Metadata
                const { error: authError } = await supabase.auth.updateUser({
                    data: { full_name: name }
                });
                if (authError) throw authError;

                // Update Public Profile Table
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ full_name: name, updated_at: new Date().toISOString() })
                    .eq('id', user.id);
                if (profileError) throw profileError;

                toast.success("تم تحديث الاسم بنجاح");
            }

            if (user && password.length >= 6) {
                const { error: passError } = await supabase.auth.updateUser({ password });
                if (passError) throw passError;

                toast.success("تم تحديث كلمة المرور");
                setPassword("");
            }
        } catch (err: unknown) {
            let message = "فشل التحديث";
            if (err instanceof Error) {
                message = err.message;
            }
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-tajawal direction-rtl text-slate-900">
            <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <User className="w-8 h-8 text-blue-600" />
                    الإعدادات الشخصية
                </h1>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:border-blue-500 transition-all"
                                placeholder="الاسم"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                        <input
                            disabled
                            value={user?.email || ""}
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">تغيير كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:border-blue-500 transition-all"
                                placeholder="كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        حفظ التغييرات
                    </button>
                </form>
            </div>
        </div>
    );
}
