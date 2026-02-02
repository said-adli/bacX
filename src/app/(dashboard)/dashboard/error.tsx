"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Dashboard Error:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white p-6">
            <div className="max-w-md text-center space-y-6 animate-in fade-in zoom-in duration-500">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        خطأ غير متوقع
                    </h2>
                    <p className="text-white/60">
                        {error.message || "حدث خطأ أثناء تحميل لوحة التحكم. يرجى المحاولة مرة أخرى."}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-white/20 font-mono mt-2">
                            Error Ref: {error.digest}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                    <Button
                        onClick={() => reset()}
                        className="bg-white text-black hover:bg-white/90 font-bold px-8 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        إعادة المحاولة
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => window.location.href = '/'}
                        className="border-white/10 text-white hover:bg-white/5"
                    >
                        العودة للرئيسية
                    </Button>
                </div>
            </div>
        </div>
    );
}
