"use client";

import { useEffect, useState, ReactNode } from "react";

interface SafeHydrateProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * SafeHydrate - Prevents hydration mismatches for client-only content
 * 
 * Use this wrapper for content that:
 * - Uses window/localStorage/sessionStorage
 * - Depends on client-side calculations (dates, random values)
 * - Would cause hydration warnings if rendered during SSR
 * 
 * @example
 * <SafeHydrate fallback={<Skeleton />}>
 *   <ClientOnlyComponent />
 * </SafeHydrate>
 */
export function SafeHydrate({ children, fallback = null }: SafeHydrateProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * ClientOnly - Alternative naming for SafeHydrate
 * More semantic when used for strictly client-side components
 */
export const ClientOnly = SafeHydrate;
