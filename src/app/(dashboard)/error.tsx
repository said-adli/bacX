"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { logger } from "@/lib/logger";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error("Dashboard routing or rendering error caught in (dashboard)/error.tsx", error);
    }, [error]);

    return (
        <ErrorState
            error={error}
            reset={reset}
            title="حدث خطأ في لوحة التحكم"
            message="نعتذر، واجهنا مشكلة أثناء تحميل الواجهة. يرجى إعادة المحاولة."
        />
    );
}
