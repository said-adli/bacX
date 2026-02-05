"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function LiveBanner() {
    const router = useRouter();
    const supabase = createClient();


    // FETCH (SWR)
    const fetchLiveStatus = async () => {
        const { data } = await supabase.from("system_settings").select("value").eq("key", "live_mode").single();
        return !!data?.value;
    };

    const { data: isLive } = useSWR('live_mode_status', fetchLiveStatus, {
        refreshInterval: 60000, // 1 Minute Polling
        fallbackData: false
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!isLive) return null;

    return (
        <div className="w-full bg-red-600 text-white animate-in slide-in-from-top duration-500 relative z-50 shadow-lg shadow-red-900/20">
            <Link href="/live" className="container mx-auto max-w-7xl px-4 h-12 flex items-center justify-between hover:bg-red-700 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/10 rounded-full animate-pulse">
                        <Radio size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-sm tracking-wide uppercase">Live Session in Progress</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium opacity-90 group-hover:underline">Join Now</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-50 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
        </div>
    );
}
