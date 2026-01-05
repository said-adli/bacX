import { useLiveStatus } from "@/hooks/useLiveStatus";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Lock, SignalHigh, Radio, CalendarClock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { DynamicWatermark } from "@/components/security/DynamicWatermark";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Separate component for redirect to avoid hydration issues
function RedirectToAuth() {
    const router = useRouter();

    useEffect(() => {
        router.push('/auth');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );
}

export default function LivePage() {
    const { isLive, youtubeId, title } = useLiveStatus();
    const { user, profile, loading: authLoading } = useAuth();

    // Derived state - no need for useEffect
    const isSubscribed = profile?.role === 'admin' || !!profile?.is_subscribed;

    // --- GUARD: LOADING ---
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // --- GUARD: NOT AUTHENTICATED ---
    // Use a component with useEffect for redirect to avoid hydration issues
    if (!user) {
        return <RedirectToAuth />;
    }

    // --- GUARD: NOT SUBSCRIBED ---
    if (!isSubscribed) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 font-tajawal">محتوى حصري</h1>
                    <p className="text-zinc-400 mb-8 font-tajawal">
                        هذا البث المباشر متاح فقط للمشتركين في باقة &quot;النخبة&quot;.
                    </p>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        اشترك الآن
                    </Button>
                </GlassCard>
            </div>
        );
    }



    return (
        <main className="min-h-screen bg-[#050505] text-white overflow-hidden relative select-none">
            {/* Cinematic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-[#050505] to-[#050505] pointer-events-none" />

            {isLive ? (
                // --- LIVE MODE ---
                <div className="absolute inset-0 flex flex-col">
                    {/* Header */}
                    <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <div className="flex items-center gap-3 pointer-events-auto">
                            <div className="bg-red-600 px-3 py-1 rounded flex items-center gap-2 shadow-sm animate-pulse">
                                <SignalHigh className="w-4 h-4 text-white" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Live</span>
                            </div>
                            <h1 className="text-lg font-tajawal font-bold text-white drop-shadow-md">{title}</h1>
                        </div>

                        {/* Viewer Count Mockup - Removed Blur for Performance */}
                        <div className="bg-black/80 px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-zinc-300">
                            ● LIVE
                        </div>
                    </header>

                    {/* Player Container */}
                    <div className="flex-1 w-full h-full relative group">
                        {/* Youtube Embed */}
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0&controls=1&showinfo=0`}
                            className="w-full h-full object-contain bg-black"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />

                        {/* --- WATERMARK OVERLAY --- */}
                        <DynamicWatermark user={user} />
                    </div>
                </div>
            ) : (
                // --- OFFLINE MODE ---
                <div className="min-h-screen flex items-center justify-center p-4">
                    <GlassCard className="max-w-2xl w-full p-12 text-center border-white/5 relative overflow-hidden">
                        {/* Decorative Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

                        <div className="relative z-10">
                            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Radio className="w-10 h-10 text-zinc-600" />
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold font-tajawal mb-4 text-white">لا يوجد بث مباشر حالياً</h1>
                            <p className="text-zinc-400 text-lg font-tajawal mb-10 max-w-lg mx-auto">
                                نحن نحضر لشيء مميز. ترقب الإعلانات في لوحة التحكم لمعرفة موعد الجلسة القادمة.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <CalendarClock className="w-5 h-5 text-primary" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs text-zinc-500 uppercase tracking-widest">البث القادم</span>
                                        <span className="text-sm font-medium text-white">قريباً</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </main>
    );
}
