"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Radio } from "lucide-react";

export function RealtimeSystemStatus() {
    const router = useRouter();
    const supabase = createClient();

    // FETCH (SWR)
    const fetchData = async () => {
        const { data } = await supabase.from("system_settings").select("*");
        return data || [];
    };

    const { data: settings } = useSWR('system_settings', fetchData, {
        refreshInterval: 60000, // 1 Minute Polling
        revalidateOnFocus: true,
        dedupingInterval: 10000,
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Derived Logic
    const maintenance = settings?.find((d: { key: string; value: any }) => d.key === "maintenance_mode")?.value;

    if (!mounted) return null;

    return maintenance ? (
        <div className="fixed inset-0 z-[100] bg-[#050510] flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">We are under Maintenance</h1>
            <p className="text-zinc-500 max-w-md">The platform is currently being updated to serve you better. Please check back shortly.</p>
        </div>
    ) : null;
}
