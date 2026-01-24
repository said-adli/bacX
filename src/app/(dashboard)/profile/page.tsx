"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { User, MapPin, Loader2, BookOpen, GraduationCap, Shield, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { UserAvatar } from "@/components/ui/UserAvatar";
import Link from "next/link";

export default function ProfilePage() {
    const { user, profile: contextProfile, refreshProfile } = useAuth();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [fetchedProfile, setFetchedProfile] = useState<any>(null);

    useEffect(() => {
        const fetchRealProfile = async () => {
            if (!user) return;
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                setFetchedProfile(data);
            }
            setLoading(false);
        };

        if (user) fetchRealProfile();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    const displayProfile = fetchedProfile || contextProfile || {};

    // Labels
    const studySystemLabel = displayProfile.study_system === 'regular' ? 'طالب نظامي' :
        displayProfile.study_system === 'private' ? 'طالب حر' :
            "غير محدد";

    const majorLabels: Record<string, string> = {
        science: "علوم تجريبية",
        math: "رياضيات",
        tech: "تقني رياضي",
        gest: "تسيير واقتصاد",
        letter: "آداب وفلسفة",
        lang: "لغات أجنبية"
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">الملف الشخصي</h1>

            <GlassCard className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-white/10">
                    <div className="w-24 h-24">
                        <UserAvatar
                            src={displayProfile.avatar_url}
                            fallback={displayProfile.full_name}
                            size="xl"
                            className="w-24 h-24 text-3xl"
                        />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">{displayProfile.full_name || "مستخدم جديد"}</h2>
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
                                    {majorLabels[displayProfile.major] || displayProfile.major}
                                </span>
                            )}
                            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                <Shield className="w-3 h-3 text-yellow-400" />
                                {displayProfile.role === 'admin' ? "مسؤول (Admin)" : "طالب (Student)"}
                            </span>
                        </div>
                    </div>

                    <Link href="/settings" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors">
                        تعديل الملف
                    </Link>
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
                        <p className="text-lg font-medium text-white text-right" dir="auto">{displayProfile.wilaya || "غير محدد"}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            الشعبة
                        </label>
                        <p className="text-lg font-medium text-white">
                            {majorLabels[displayProfile.major] || displayProfile.major || "غير محدد"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            نظام الدراسة
                        </label>
                        <p className="text-lg font-medium text-white">{studySystemLabel}</p>
                    </div>

                    <div className="space-y-1 col-span-1 md:col-span-2">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            نبذة
                        </label>
                        <p className="text-base text-white/80 leading-relaxed max-w-2xl bg-white/5 p-4 rounded-xl">
                            {displayProfile.bio || "لا توجد نبذة تعريفية."}
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}

