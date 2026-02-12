"use client";

import Link from "next/link";
import { useLiveStatus } from "@/hooks/useLiveStatus";

export default function LiveStatus() {
    const { isLive } = useLiveStatus();

    if (!isLive) return null;

    return (
        <Link href="/live" className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-all group cursor-pointer animate-in fade-in slide-in-from-top-2">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold text-red-400 tracking-wider group-hover:text-red-300 transition-colors">LIVE</span>
        </Link>
    );
}
