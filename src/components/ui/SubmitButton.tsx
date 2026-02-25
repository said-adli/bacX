"use client";

import { useFormStatus } from "react-dom";
import { LoadingSpinner } from "./LoadingSpinner"; // Assumed path, will check

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    pendingText?: string;
    className?: string;
}

export function SubmitButton({
    children,
    pendingText = "Submitting...",
    className = "",
    ...props
}: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            {...props}
            disabled={pending || props.disabled}
            className={`btn btn-primary flex items-center justify-center gap-2 ${className}`}
        >
            {pending ? (
                <>
                    <LoadingSpinner className="w-4 h-4" />
                    {pendingText}
                </>
            ) : (
                children
            )}
        </button>
    );
}
