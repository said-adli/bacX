"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { logger } from "@/lib/logger";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error("Admin routing or rendering error caught in admin/error.tsx", error);
    }, [error]);

    return (
        <ErrorState
            error={error}
            reset={reset}
            title="خطأ في لوحة التحكم"
            message="حدث خطأ أثناء تحميل لوحة الإدارة. يرجى إعادة المحاولة أو التواصل مع الفريق التقني."
        />
    );
}
