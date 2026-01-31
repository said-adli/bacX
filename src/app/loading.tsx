import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-500">
            <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />

                {/* Logo / Spinner */}
                <div className="relative w-20 h-20 bg-black border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            </div>

            <p className="mt-8 text-white/40 text-sm font-medium animate-pulse">
                جاري التحميل...
            </p>
        </div>
    );
}
