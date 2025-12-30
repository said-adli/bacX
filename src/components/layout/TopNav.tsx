"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search } from "lucide-react";
// import { cn } from "@/lib/utils";

export function TopNav() {
    const { user } = useAuth();

    return (
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
            {/* Search Bar (Visual Only) */}
            <div className="relative w-96 hidden md:block">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="ابحث عن درس، أستاذ، أو موضوع..."
                    className="w-full bg-muted/50 border border-input rounded-full py-2.5 pr-10 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors relative border border-border">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
                </button>

                <div className="flex items-center gap-3 pl-2 border-l border-border">
                    <div className="text-left hidden md:block">
                        <div className="text-sm font-bold text-foreground font-sans">{user?.displayName || "طالب نجيب"}</div>
                        <div className="text-xs text-muted-foreground font-sans text-right">المستوى النهائي</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 ring-2 ring-background">
                        {user?.displayName?.[0]?.toUpperCase() || "S"}
                    </div>
                </div>
            </div>
        </header>
    );
}
