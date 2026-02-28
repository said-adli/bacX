
"use client";

import React, { Component, ErrorInfo } from "react";
// import { logErrorToFirestore } from "@/lib/logging"; // Removed legacy logging
import { GlassCard } from "./ui/GlassCard";
import { AlertOctagon, RefreshCw } from "lucide-react";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_error: Error): State {
        void _error;
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to Console instead of Firestore
        console.error("Global Error Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans text-white">
                    <GlassCard className="max-w-md p-8 text-center border-red-500/30 bg-red-950/10">
                        <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-zinc-400 mb-6">
                            نأسف، حدث خطأ غير متوقع. تم إبلاغ الفريق التقني وسيتم إصلاحه فوراً.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            تحديث الصفحة
                        </button>
                    </GlassCard>
                </div>
            );
        }

        return this.props.children;
    }
}
