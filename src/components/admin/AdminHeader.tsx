"use client";

import { Bell, Search, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminHeader() {
    return (
        <header className="h-20 w-full border-b border-white/5 bg-black/10 backdrop-blur-md flex items-center justify-between px-8 z-40">

            {/* Search / Breadcrumbs (Placeholder) */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search database..."
                        className="w-full h-12 bg-black/20 border border-white/5 rounded-full pl-12 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all font-tajawal"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">

                {/* Live Toggle Placeholder */}
                <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-full border border-white/5">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Broadcast</span>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <button className="flex items-center gap-2 group">
                        <div className="w-2 h-2 rounded-full bg-zinc-600 group-hover:bg-red-500 transition-colors shadow-[0_0_5px_rgba(0,0,0,0)] group-hover:shadow-[0_0_10px_#ef4444]" />
                        <span className="text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">OFFLINE</span>
                    </button>
                </div>

                {/* Notifications */}
                <button className="relative p-3 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#050510]" />
                </button>

                {/* Profile Helper (Visual) */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 border border-white/10 shadow-lg" />
            </div>
        </header>
    );
}
