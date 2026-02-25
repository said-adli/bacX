import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { SmartButton } from "@/components/ui/SmartButton";
import { GlassCard } from "@/components/ui/GlassCard";

interface ErrorStateProps {
    error: Error & { digest?: string };
    reset: () => void;
    title?: string;
    message?: string;
}

export function ErrorState({
    error,
    reset,
    title = "حدث خطأ غير متوقع",
    message = "نعتذر، واجهنا مشكلة أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى."
}: ErrorStateProps) {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
            <GlassCard className="max-w-md p-10 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.05)]">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                <h1 className="text-3xl font-serif font-bold text-white mb-4">
                    {title}
                </h1>

                <p className="text-white/60 leading-relaxed mb-8">
                    {message}
                    {process.env.NODE_ENV !== 'production' && (
                        <span className="block mt-4 p-4 rounded-xl bg-black/40 border border-red-500/20 text-red-400 text-sm font-mono text-left overflow-hidden text-ellipsis whitespace-nowrap" dir="ltr">
                            {error.message}
                        </span>
                    )}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <SmartButton
                        onClick={reset}
                        className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-500 hover:to-orange-500 px-8"
                    >
                        <RotateCcw className="w-5 h-5 ml-2" />
                        إعادة المحاولة
                    </SmartButton>

                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <SmartButton className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8">
                            <Home className="w-5 h-5 ml-2" />
                            الرئيسية
                        </SmartButton>
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
