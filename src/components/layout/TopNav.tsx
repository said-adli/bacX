"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search } from "lucide-react";
// import { cn } from "@/lib/utils";

export function TopNav() {
    const { user } = useAuth();

    return (
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
            {/* Search (Visual Only) */}
            <div className="flex-1 max-w-md hidden md:block">
                <div className="relative group">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="ابحث عن درس..."
                        className="w-full bg-slate-100/50 border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mr-auto">
                {/* Notification Bell */}
                <button className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 left-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-2 border-r border-slate-200 pr-4">
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user?.displayName || "Student"}</p>
                        <p className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded-full inline-block">BAC 2025</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                        {user?.displayName?.[0] || "S"}
                    </div>
                </div>
            </div>
        </header>
    );
}
