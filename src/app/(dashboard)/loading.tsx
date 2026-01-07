"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="w-full h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">جاري التحميل...</p>
        </div>
    );
}
