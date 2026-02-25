import { MapPinOff, Home, Search } from "lucide-react";
import Link from "next/link";
import { SmartButton } from "@/components/ui/SmartButton";
import { GlassCard } from "@/components/ui/GlassCard";

interface NotFoundStateProps {
    title?: string;
    message?: string;
    actionLink?: string;
    actionLabel?: string;
}

export function NotFoundState({
    title = "الصفحة غير موجودة",
    message = "عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد يكون الرابط خاطئاً أو تم نقل الصفحة.",
    actionLink = "/dashboard",
    actionLabel = "العودة للرئيسية"
}: NotFoundStateProps) {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <GlassCard className="max-w-md p-10 relative overflow-hidden">
                {/* 404 Background text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-white/[0.02] pointer-events-none select-none z-0 tracking-widest font-mono">
                    404
                </div>

                <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <MapPinOff className="w-10 h-10 text-purple-400" />
                    </div>

                    <h1 className="text-3xl font-serif font-bold text-white mb-4">
                        {title}
                    </h1>

                    <p className="text-white/60 leading-relaxed mb-10">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={actionLink} className="w-full sm:w-auto">
                            <SmartButton className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 px-8 py-6 text-lg shadow-lg shadow-blue-900/20">
                                <Home className="w-5 h-5 ml-2" />
                                {actionLabel}
                            </SmartButton>
                        </Link>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
