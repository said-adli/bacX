"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Radio, LogOut, User, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export function AdminHeader({ user }: { user: any }) {
    const router = useRouter();
    const supabase = createClient();

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [isLive, setIsLive] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Polling Status Sync (60s interval)
    useEffect(() => {
        let isMounted = true;
        const fetchStatus = async () => {
            if (document.hidden) return; // Don't poll if hidden
            try {
                const { data } = await supabase.from("system_settings").select("*").eq("key", "live_mode").single();
                if (isMounted && data) setIsLive(!!data.value);
            } catch (e) {
                console.error("Polling error", e);
            }
        };

        fetchStatus(); // Initial
        const interval = setInterval(fetchStatus, 60000); // 60s Polling

        const handleVisibilityChange = () => {
            if (!document.hidden) fetchStatus();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            isMounted = false;
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    // Handlers
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            router.push(`/admin/students?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        toast.success("Logged out");
    };

    return (
        <header className="h-20 w-full border-b border-white/5 bg-black/10 backdrop-blur-md flex items-center justify-between px-8 z-40">

            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search student by name..."
                        className="w-full h-12 bg-black/20 border border-white/5 rounded-full pl-12 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all font-tajawal"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">

                {/* Live Status Badge */}
                <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isLive ? 'bg-red-900/20 border-red-500/30' : 'bg-black/40 border-white/5'}`}>
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider hidden md:block">Broadcast</span>
                    <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-colors shadow-[0_0_8px_rgba(0,0,0,0)] ${isLive ? 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse' : 'bg-zinc-600'}`} />
                        <span className={`text-xs font-bold transition-colors ${isLive ? 'text-red-400' : 'text-zinc-500'}`}>
                            {isLive ? 'ON AIR' : 'OFFLINE'}
                        </span>
                    </div>
                </div>

                {/* Notifications (Disabled for now) */}
                <button className="relative p-3 rounded-full hover:bg-white/5 text-zinc-600 cursor-not-allowed opacity-50" title="Notifications coming soon">
                    <Bell size={20} />
                </button>

                {/* Profile Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 border border-white/10 shadow-lg flex items-center justify-center text-xs font-bold text-white">
                            {user?.email?.[0].toUpperCase() || "A"}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-xs font-bold text-white leading-none mb-1">Admin</p>
                            <p className="text-[10px] text-zinc-500 leading-none">Global Control</p>
                        </div>
                        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#0A0A15] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in zoom-in-95 duration-100 origin-top-right">
                                <div className="px-3 py-2 border-b border-white/5 mb-1">
                                    <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                                </div>
                                <Link
                                    href="/admin/settings"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <User size={16} /> Profile Settings
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
