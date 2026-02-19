"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Red Tint Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-red-900/10 blur-[8px] rounded-full" />
            </div>

            <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20 relative z-10">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 font-tajawal">حدث خطأ غير متوقع</h2>
                <p className="text-zinc-400 mb-8 font-tajawal">
                    نواجه مشكلة بسيطة في الاتصال. لا تقلق، يمكنك المحاولة مرة أخرى.
                </p>

                <Button
                    onClick={() => reset()}
                    className="w-full bg-white text-black hover:bg-zinc-200"
                    icon={RefreshCcw}
                >
                    إعادة المحاولة
                </Button>
            </GlassCard>
        </main>
    );
}
