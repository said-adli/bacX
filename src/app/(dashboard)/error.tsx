"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to logging service
        console.error("Dashboard Error:", error);
    }, [error]);

    return (
        <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
            <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2 font-tajawal">خطأ في تحميل المحتوى</h2>
                <p className="text-zinc-400 mb-8 font-tajawal text-sm">
                    واجهنا مشكلة في تحميل واجهة القيادة. يمكنك تحديث الصفحة أو المحاولة مرة أخرى.
                </p>

                <div className="flex gap-4">
                    <Button
                        onClick={() => reset()}
                        className="flex-1 bg-white text-black hover:bg-zinc-200"
                        icon={RefreshCcw}
                    >
                        إعادة المحاولة
                    </Button>
                    <Button
                        onClick={() => window.location.reload()}
                        className="flex-1 border border-white/10 hover:bg-white/5"
                    >
                        تحديث الصفحة
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
}
