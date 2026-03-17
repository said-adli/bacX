"use client";

import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

interface RaiseHandButtonProps {
    status: 'idle' | 'waiting' | 'live' | 'ended';
    onClick: () => void;
    currentSpeakerName?: string;
}

export function RaiseHandButton({ status, onClick, currentSpeakerName }: RaiseHandButtonProps) {
    if (status === 'live') {
        return (
            <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative px-6 py-4 bg-black/60 backdrop-blur-xl border border-blue-500/50 rounded-2xl flex items-center gap-4 shadow-2xl">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        <div>
                            <span className="block text-white font-bold text-lg">تتحدث الآن</span>
                            <span className="text-blue-400 text-xs">صوتك مسموع للجميع</span>
                        </div>
                        <button
                            onClick={onClick}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            إنهاء
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'waiting') {
        return (
            <div className="fixed bottom-8 right-8 z-50">
                <div className="relative px-6 py-4 bg-black/60 backdrop-blur-xl border border-yellow-500/30 rounded-2xl flex items-center gap-4 shadow-xl">
                    <div className="animate-spin w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full" />
                    <div className="text-right">
                        <span className="block text-white font-bold">في الانتظار...</span>
                        <span className="text-yellow-400 text-xs">دورك قادم قريباً</span>
                    </div>
                    <button
                        onClick={onClick}
                        className="text-white/40 hover:text-white text-xs underline"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        );
    }

    // IDLE State
    return (
        <button
            onClick={onClick}
            className={cn(
                "fixed bottom-8 right-8 z-50 group transition-all duration-300 transform hover:scale-105 active:scale-95",
                "bg-black/40 backdrop-blur-md border border-white/10 hover:border-blue-500/50",
                "rounded-full p-4 pl-8 pr-4 shadow-2xl flex items-center gap-3 overflow-hidden"
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex flex-col items-end text-right">
                <span className="text-white font-bold text-sm">رفع اليد</span>
                <span className="text-white/40 text-[10px]">للمشاركة الصوتية</span>
            </div>

            <div className="relative z-10 w-12 h-12 bg-white/5 group-hover:bg-blue-600 rounded-full flex items-center justify-center border border-white/10 group-hover:border-blue-400 transition-colors">
                <Hand className="w-6 h-6 text-white group-hover:animate-wave" />
            </div>
        </button>
    );
}
