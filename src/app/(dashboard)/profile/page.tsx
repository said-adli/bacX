"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { User, MapPin, Loader2, BookOpen, GraduationCap, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, profile, refreshProfile } = useAuth();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);

    // Use profile from context as primary source, fallback to local state if needed
    // But since context is hydrated, we can rely on it.

    useEffect(() => {
        if (profile) {
            setLoading(false);
        } else {
            // Force refresh if no profile yet (should be handled by context but safety first)
            refreshProfile().then(() => setLoading(false));
        }
    }, [profile, refreshProfile]);

    if (loading && !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    const displayProfile: any = profile || {
        full_name: "مستخدم",
        wilaya: "غير محدد",
        major: "غير محدد",
        study_system: "غير محدد",
        role: "student"
    };

    const studySystemLabel = displayProfile.study_system === 'regular' ? 'طالب نظامي' :
        displayProfile.study_system === 'private' ? 'طالب حر' :
            displayProfile.study_system || "غير محدد";

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">الملف الشخصي</h1>

            <GlassCard className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-white/10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">
                                {displayProfile.full_name?.charAt(0).toUpperCase() || <User className="w-10 h-10 text-white/80" />}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{displayProfile.full_name}</h2>
                        <div className="flex flex-wrap gap-2 text-sm text-white/60">
                            {displayProfile.study_system && (
                                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" />
                                    {studySystemLabel}
                                </span>
                            )}
                            {displayProfile.major && (
                                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {displayProfile.major}
                                </span>
                            )}
                            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                <Shield className="w-3 h-3 text-yellow-400" />
                                {displayProfile.role === 'admin' ? "مسؤول (Admin)" : "طالب (Student)"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            الاسم الكامل
                        </label>
                        <p className="text-lg font-medium text-white">{displayProfile.full_name || "غير محدد"}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            الولاية
                        </label>
                        <p className="text-lg font-medium text-white">{displayProfile.wilaya || "غير محدد"}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            الشعبة
                        </label>
                        <p className="text-lg font-medium text-white">
                            {displayProfile.major || "غير محدد"}
                            {displayProfile.major === 'science' && " (علوم تجريبية)"}
                            {displayProfile.major === 'math' && " (رياضيات)"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            نظام الدراسة
                        </label>
                        <p className="text-lg font-medium text-white">{studySystemLabel}</p>
                    </div>
                </div>
            </GlassCard>

            <div className="text-center text-white/20 text-sm">
                لتعديل هذه المعلومات، انتقل إلى <a href="/settings" className="hover:text-white underline">الإعدادات</a>
            </div>
        </div>
    );
}
