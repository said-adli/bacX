"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { logger } from "@/lib/logger";

export default function AuthError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error("Auth routing or rendering error caught in (auth)/error.tsx", error);
    }, [error]);

    return (
        <ErrorState
            error={error}
            reset={reset}
            title="مشكلة في المصادقة"
            message="حدث خطأ أثناء معالجة بيانات تسجيل الدخول أو التسجيل. يرجى المحاولة مرة أخرى."
        />
    );
}
