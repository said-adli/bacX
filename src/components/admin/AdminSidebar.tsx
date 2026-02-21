"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    Users,
    CreditCard,
    Receipt,
    Layers,
    Settings,
    LogOut,
    ShieldAlert,
    Radio,
    Sparkles
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const links = [
        { name: "Live Room", href: "/admin/live", icon: Radio },
        { name: "Dashboard", href: "/admin", icon: BarChart3 },
        { name: "Students", href: "/admin/students", icon: Users },
        { name: "Payments", href: "/admin/payments", icon: Receipt },
        { name: "Offers", href: "/admin/offers", icon: CreditCard },
        { name: "Content", href: "/admin/content", icon: Layers },
        { name: "Updates", href: "/admin/updates", icon: Sparkles },
        { name: "Logs", href: "/admin/logs", icon: ShieldAlert },
        { name: "Controls", href: "/admin/controls", icon: Settings },
    ];

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh(); // Force cache invalidation
    }

    return (
        <aside className="w-64 h-full border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col p-4 z-50 transition-all duration-300">
            {/* Logo Area */}
            <div className="flex items-center gap-3 mb-10 px-2 pt-2">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    <Logo className="text-blue-500 w-7 h-7" />
                </div>
                <div>
                    <h1 className="font-bold text-2xl tracking-wider text-white">COMMAND</h1>
                    <p className="text-[11px] text-blue-400 font-mono tracking-widest uppercase">CENTER v2.0</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <link.icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", isActive && "text-blue-400")} />
                            <span className="font-medium">{link.name}</span>

                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="mt-auto pt-6 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout System</span>
                </button>
            </div>
        </aside>
    )
}
