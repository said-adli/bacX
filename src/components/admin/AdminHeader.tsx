'use client';

import { Bell, Search, Link as LinkIcon, Save, Circle } from "lucide-react";
import { AdminGlassCard } from "./ui/AdminGlassCard";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function AdminHeader() {
    const { logout } = useAuth();
    const [liveLinkOpen, setLiveLinkOpen] = useState(false);
    const [liveLink, setLiveLink] = useState("");

    const handleUpdateLiveLink = () => {
        // Placeholder for actual update logic
        if (!liveLink) return;
        toast.success("Live session link updated successfully!");
        setLiveLinkOpen(false);
        // TODO: Call actual server action here
    };

    return (
        <header className="sticky top-0 z-30 mb-8 border-b border-white/10 bg-black/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-8">

                {/* Left: Breadcrumbs / Title (Placeholder) */}
                <div className="flex items-center gap-4">
                    {/* Can insert dynamic breadcrumbs here */}
                    <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                        </span>
                        System Operational
                    </div>
                </div>

                {/* Center: Global Search */}
                <div className="relative hidden w-96 md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search students, courses..."
                        className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-0"
                    />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Quick Live Link */}
                    <div className="relative">
                        <button
                            onClick={() => setLiveLinkOpen(!liveLinkOpen)}
                            className="flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-2 text-xs font-bold text-pink-400 hover:bg-pink-500/20 transition-colors"
                        >
                            <LinkIcon className="h-4 w-4" />
                            Live Link
                        </button>

                        {liveLinkOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-xl">
                                <h4 className="mb-2 text-sm font-bold text-white">Update Global Live Link</h4>
                                <div className="flex gap-2">
                                    <input
                                        value={liveLink}
                                        onChange={(e) => setLiveLink(e.target.value)}
                                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                                        placeholder="https://zoom.us/..."
                                    />
                                    <button
                                        onClick={handleUpdateLiveLink}
                                        className="rounded-lg bg-pink-600 px-3 py-2 text-white hover:bg-pink-700"
                                    >
                                        <Save className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="relative rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                    </button>

                    <div className="h-8 w-px bg-white/10" />

                    <button
                        onClick={logout}
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
}
