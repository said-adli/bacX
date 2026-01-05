"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard Error:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-[#050505] text-white">
            <GlassCard className="max-w-md w-full p-8 flex flex-col items-center text-center border-white/5 bg-white/5 backdrop-blur-xl">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold mb-2">حدث خطأ غير متوقع</h2>
                <p className="text-white/50 mb-8 text-sm leading-relaxed">
                    نعتذر، واجهنا مشكلة في تحميل لوحة التحكم. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
                </p>

                <div className="flex gap-4 w-full">
                    <Button
                        onClick={() => reset()}
                        className="flex-1 bg-white text-black hover:bg-white/90 font-bold"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        إعادة المحاولة
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => window.location.href = '/'}
                        className="flex-1 border-white/10 text-white hover:bg-white/5"
                    >
                        الرئيسية
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
}
