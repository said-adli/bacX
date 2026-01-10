"use client";

import { useAuth } from "@/context/AuthContext";
import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import { Lock, MessageCircle, Users, Video } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

// Mock Live ID (using a live stream placeholder or the demo one)
const LIVE_STREAM_ID = "enc_live_jfKfPfyJRdk"; // lofi girl as mock live
const IS_LIVE = true; // Toggle this manually to Start/Stop the stream in the UI

export default function LiveSessionsPage() {
    const { profile } = useAuth();
    const isSubscribed = profile?.is_subscribed === true;

    if (!IS_LIVE) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-700">
                <GlassCard className="p-12 text-center max-w-2xl mx-auto space-y-6 border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                    <div className="w-24 h-24 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Video className="w-10 h-10 text-white/30" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">
                        انتظرونا في الحصة القادمة
                    </h1>
                    <p className="text-xl text-white/60 font-light">
                        لا يوجد بث مباشر حالياً. سيتم إعلامكم بموعد الحصة القادمة قريباً.
                    </p>
                    <Link href="/materials" className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors mt-4">
                        تصفح الدروس المسجلة
                    </Link>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-1">الحصص المباشرة</h1>
                    <div className="flex items-center gap-2 text-red-400 text-sm font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        مباشر الآن
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Player Area */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="w-full aspect-video rounded-2xl overflow-hidden glass-panel relative border border-white/10 shadow-2xl">
                        {isSubscribed ? (
                            <EncodedVideoPlayer encodedVideoId={LIVE_STREAM_ID} />
                        ) : (
                            // GATEKEPT
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-center p-8 z-20">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
                                    <Lock size={40} />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2">البث المباشر محمي</h3>
                                <p className="text-white/60 mb-8 max-w-lg text-lg">هذه الحصة حصرية للمشتركين في الباقة الذهبية. اشترك الآن واحضر جميع الحصص المباشرة مع الأساتذة.</p>
                                <Link href="/subscription" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-blue-900/40 hover:scale-105">
                                    فتح الاشتراك الآن
                                </Link>
                            </div>
                        )}

                        {!isSubscribed && <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000')] bg-cover bg-center opacity-30 pointer-events-none mix-blend-overlay" />}
                    </div>

                    <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">مراجعة شاملة: الدوال الأسية</h2>
                            <p className="text-white/50">تقديم: الأستاذ محمد كريم</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-white/40 bg-white/5 px-4 py-2 rounded-full text-sm">
                                <Users size={16} />
                                <span>1,240 مشاهد</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Placeholder (Glass) */}
                <div className="lg:col-span-1 h-[600px] flex flex-col">
                    <GlassCard className="flex-1 flex flex-col w-full h-full p-0 overflow-hidden bg-black/20">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <h3 className="font-bold flex items-center gap-2">
                                <MessageCircle size={18} />
                                المحادثة المباشرة
                            </h3>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                            {!isSubscribed ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-white/30 text-sm">
                                    <Lock size={24} className="mb-2 opacity-50" />
                                    <p>المحادثة متاحة للمشتركين فقط</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-2 items-start opacity-50">
                                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-[10px] flex items-center justify-center text-purple-200">A</div>
                                        <div>
                                            <span className="text-xs font-bold text-white/40 block">Ahmed</span>
                                            <p className="text-xs text-white/70">هل الدرس مسجل يا أستاذ؟</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-[10px] flex items-center justify-center text-blue-200">S</div>
                                        <div>
                                            <span className="text-xs font-bold text-blue-300 block">Sara (Admin)</span>
                                            <p className="text-xs text-white">نعم، سيتم رفع التسجيل بعد انتهاء الحصة مباشرة.</p>
                                        </div>
                                    </div>
                                    {/* Fake streaming chat effect could go here */}
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-white/5 bg-white/5">
                            <input
                                type="text"
                                disabled={!isSubscribed}
                                placeholder={isSubscribed ? "اكتب رسالة..." : "اشترك للمشاركة"}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
}
