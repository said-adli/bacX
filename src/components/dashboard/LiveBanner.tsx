"use client";

import { createClient } from "@/utils/supabase/client";
import useSWR from "swr";
import { Radio } from "lucide-react";
import Link from "next/link";

export default function LiveBanner() {
    const supabase = createClient();

    // FETCH (SWR)
    const fetchLiveStatus = async () => {
        const { data } = await supabase.from("system_settings").select("value").eq("key", "live_mode").single();
        return !!data?.value;
    };

    const { data: isLive, isLoading } = useSWR('live_mode_status', fetchLiveStatus, {
        refreshInterval: 60000, // 1 Minute Polling
        fallbackData: false
    });

    // Don't render during SSR or loading to avoid hydration mismatch
    if (isLoading || !isLive) return null;

    return (
        <div className="w-full bg-red-600 text-white animate-in slide-in-from-top duration-500 relative z-50 shadow-lg shadow-red-900/20">
            <Link href="/live" className="container mx-auto max-w-7xl px-4 h-12 flex items-center justify-between hover:bg-red-700 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                    <Radio className="w-5 h-5 text-white animate-pulse" />
                    <span className="font-bold">🔴 البث المباشر قيد التشغيل الآن!</span>
                </div>
                <span className="text-sm group-hover:underline">انضم الآن ←</span>
            </Link>
        </div>
    );
}
