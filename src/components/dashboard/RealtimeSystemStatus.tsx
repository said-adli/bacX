"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Radio } from "lucide-react";

export function RealtimeSystemStatus() {
    const router = useRouter();
    const supabase = createClient();
    const [maintenance, setMaintenance] = useState(false);
    const [live, setLive] = useState(false);

    useEffect(() => {
        // Initial fetch
        const fetchStatus = async () => {
            const { data } = await supabase.from("system_settings").select("*");
            if (data) {
                const m = data.find((d: { key: string; value: any }) => d.key === "maintenance_mode");
                const l = data.find((d: { key: string; value: any }) => d.key === "live_mode");
                if (m) setMaintenance(!!m.value);
                if (l) setLive(!!l.value);
            }
        };
        fetchStatus();

        // Subscribe
        const channel = supabase
            .channel("system-settings-changes")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "system_settings",
                },
                (payload: any) => {
                    const { key, value } = payload.new;
                    if (key === "maintenance_mode") {
                        const isActive = !!value;
                        setMaintenance(isActive);
                        if (isActive) {
                            // Redirect or Show Overlay
                            toast.error("Entering Maintenance Mode...");
                            // In a real app, maybe redirect to /maintenance
                        } else {
                            toast.success("Maintenance Mode Ended");
                        }
                    }
                    if (key === "live_mode") {
                        const isLiveNow = !!value;
                        setLive(isLiveNow);
                        if (isLiveNow) toast.success("🔴 LIVE BROADCAST STARTED!");
                    }
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Maintenance Overlay
    if (maintenance) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#050510] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertTriangle size={40} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">We are under Maintenance</h1>
                <p className="text-zinc-500 max-w-md">The platform is currently being updated to serve you better. Please check back shortly.</p>
            </div>
        );
    }

    // Live logic moved to <LiveBanner /> attached in DashboardShell
    return null;
}
