"use client";

import { useRouter } from "next/navigation";
import { useTransition, ReactNode, MouseEvent, forwardRef } from "react";
import Link from "next/link";

// ============================================================================
// TRANSITION LINK - NON-BLOCKING NAVIGATION
// ============================================================================
// Wraps navigation in React's startTransition to prevent main thread blocking.
// Falls back to regular Link behavior if JavaScript is disabled.
// ============================================================================

interface TransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    prefetch?: boolean;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
    function TransitionLink({ href, children, className, onClick, prefetch = false }, ref) {
        const router = useRouter();
        const [isPending, startTransition] = useTransition();

        const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();

            // Call any additional onClick handler
            onClick?.();

            // Wrap navigation in startTransition to prevent blocking
            startTransition(() => {
                router.push(href);
            });
        };

        return (
            <Link
                ref={ref}
                href={href}
                prefetch={prefetch}
                onClick={handleClick}
                className={className}
                data-pending={isPending ? "true" : undefined}
            >
                {children}
            </Link>
        );
    }
);
