"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Megaphone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Broadcast {
    id: string;
    title: string;
    message: string;
    created_at: string;
}

export default function BroadcastReceiver() {
    const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchLatestBroadcast = async () => {
            try {
                // Fetch latest notification
                const { data, error } = await supabase
                    .from("global_notifications")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error || !data) return;

                // Check recency (e.g. 48 hours)
                const created = new Date(data.created_at);
                const now = new Date();
                const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

                if (hoursDiff < 48) {
                    // Check if run dismissed in session (optional, but good UX)
                    const dismissedId = sessionStorage.getItem("dismissed_broadcast");
                    if (dismissedId !== data.id) {
                        setBroadcast(data);
                        setIsVisible(true);
                    }
                }
            } catch (e) {
                console.error("Broadcast fetch error", e);
            }
        };

        fetchLatestBroadcast();

        // Subscribe to NEW broadcasts
        const channel = supabase
            .channel("broadcast-listener")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "global_notifications",
                },
                (payload: any) => {
                    setBroadcast(payload.new as Broadcast);
                    setIsVisible(true);
                    // Play sound or toast?
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const dismiss = () => {
        if (broadcast) {
            sessionStorage.setItem("dismissed_broadcast", broadcast.id);
        }
        setIsVisible(false);
    };

    if (!broadcast) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    className="mb-8"
                >
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-4 md:p-6 backdrop-blur-md relative overflow-hidden group">

                        {/* Decorative Glow */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-xl shrink-0">
                                <Megaphone className="text-blue-400" size={24} />
                            </div>

                            <div className="flex-1 pt-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-white text-lg mb-1">{broadcast.title}</h3>
                                    <button
                                        onClick={dismiss}
                                        className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <p className="text-zinc-300 text-sm leading-relaxed">{broadcast.message}</p>
                                <p className="text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-widest">
                                    Admin Message • {new Date(broadcast.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
