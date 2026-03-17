"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { logger } from "@/lib/logger";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error securely for telemetry/debugging
        logger.error("Global routing or rendering error caught in app/error.tsx", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center p-4">
            <ErrorState
                error={error}
                reset={reset}
                title="عذراً، حدث خطأ في النظام"
                message="واجهنا مشكلة غير متوقعة. يرجى إعادة المحاولة أو العودة للصفحة الرئيسية."
            />
        </div>
    );
}
