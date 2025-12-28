"use client";

import { useAuth } from "@/context/AuthContext";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { BookOpen, Radio, Calendar, ArrowLeft, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const { isLive, title: liveTitle } = useLiveStatus();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth");
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/auth");
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] p-6 pb-24 md:pb-6 text-white font-tajawal relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">مرحباً، {user.displayName || "طالب العلم"} 👋</h1>
                        <p className="text-zinc-400 text-sm">جاهز لمواصلة رحلة التفوق؟</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <LogOut className="w-5 h-5 ml-2" />
                        <span className="hidden md:inline">تسجيل الخروج</span>
                    </Button>
                </header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* 1. Live Status Card (Featured) */}
                    <div className="md:col-span-2">
                        <GlassCard className={`h-full p-8 flex flex-col justify-between relative overflow-hidden group ${isLive ? 'border-red-500/30 bg-red-950/10' : ''}`}>
                            {isLive && (
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                                        <Radio className="w-3 h-3" /> مباشر الآن
                                    </span>
                                </div>
                            )}

                            <div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isLive ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary'}`}>
                                    <Radio className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">{isLive ? liveTitle || "بث مباشر قيد التشغيل" : "لا يوجد بث مباشر حالياً"}</h2>
                                <p className="text-zinc-400 text-sm max-w-md">
                                    {isLive
                                        ? "التحق الآن بالدرس المباشر وتفاعل مع الأستاذ وزملائك في الوقت الحقيقي."
                                        : "تابع جدول الحصص لمعرفة موعد البث القادم. يمكنك مراجعة الدروس المسجلة في هذه الأثناء."}
                                </p>
                            </div>

                            <div className="mt-8">
                                {isLive ? (
                                    <Link href="/live">
                                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg shadow-lg shadow-red-900/20">
                                            الالتحاق بالبث
                                            <ArrowLeft className="w-5 h-5 mr-2" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button disabled className="w-full bg-white/5 text-zinc-500 cursor-not-allowed">
                                        البث غير متاح
                                    </Button>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* 2. Quick Actions Column */}
                    <div className="space-y-6">
                        {/* Lessons Link */}
                        <Link href="/lessons" className="block group">
                            <GlassCard className="p-6 h-full hover:bg-white/5 transition-colors border-white/5 hover:border-primary/30">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors -rotate-45 group-hover:rotate-0" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">مكتبة الدروس</h3>
                                <p className="text-xs text-zinc-500">تصفح جميع الدروس المسجلة حسب المادة</p>
                            </GlassCard>
                        </Link>

                        {/* Schedule/Profile Placeholder */}
                        <div className="group">
                            <GlassCard className="p-6 h-full border-white/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mb-1">جدول الحصص</h3>
                                <p className="text-xs text-zinc-500">سيتم تحديث الجدول قريباً</p>
                            </GlassCard>
                        </div>
                    </div>
                </div>

                {/* Footer / Quick Nav (Mobile optimized implies bottom nav, but for now simple links) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {['الرياضيات', 'الفيزياء', 'العلوم', 'اللغات'].map((subject) => (
                        <Link href={`/lessons?filter=${subject}`} key={subject}>
                            <GlassCard className="p-4 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                                <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">{subject}</span>
                            </GlassCard>
                        </Link>
                    ))}
                </div>

            </div>
        </main>
    );
}
