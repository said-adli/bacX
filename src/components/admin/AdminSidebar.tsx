"use client";

import { useState, useEffect } from "react";
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
    Sparkles,
    Ticket,
    PieChart,
    Package,
    ClipboardList,
    Megaphone,
    MonitorSmartphone,
    Calendar,
    Image as ImageIcon
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        const handleClose = () => setIsOpen(false);
        window.addEventListener("openAdminSidebar", handleOpen);
        window.addEventListener("closeAdminSidebar", handleClose);
        return () => {
            window.removeEventListener("openAdminSidebar", handleOpen);
            window.removeEventListener("closeAdminSidebar", handleClose);
        };
    }, []);

    // Close sidebar on navigation on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const links = [
        { name: "ملخص الإحصائيات", href: "/admin", icon: BarChart3 },
        { name: "التقارير المالية", href: "/admin/dashboard/financial", icon: PieChart },
        { name: "إدارة الطلبة", href: "/admin/students", icon: Users },
        { name: "الطلبات", href: "/admin/requests", icon: ClipboardList },
        { name: "إدارة المحتوى", href: "/admin/content", icon: Layers },
        { name: "المداخيل / المدفوعات", href: "/admin/payments", icon: Receipt },
        { name: "الباقات والعروض", href: "/admin/offers", icon: CreditCard },
        { name: "باقات الاشتراك", href: "/admin/plans", icon: Package },
        { name: "قسائم التخفيض", href: "/admin/coupons", icon: Ticket },
        { name: "البث المباشر", href: "/admin/live", icon: Radio },
        { name: "جدول المواعيد", href: "/admin/schedule", icon: Calendar },
        { name: "الإعلانات", href: "/admin/announcements", icon: Megaphone },
        { name: "إدارة الإعلانات", href: "/admin/hero-management", icon: ImageIcon },
        { name: "التحديثات", href: "/admin/updates", icon: Sparkles },
        { name: "السجلات", href: "/admin/logs", icon: ShieldAlert },
        { name: "أجهزة المستخدمين", href: "/admin/security/devices", icon: MonitorSmartphone },
        { name: "الإعدادات", href: "/admin/controls", icon: Settings },
    ];

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh(); // Force cache invalidation
    }

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[55] md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 right-0 z-[60] w-64 h-full border-e border-white/5 bg-black/20 backdrop-blur-xl flex flex-col p-4 transition-transform duration-300 md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="flex items-center gap-3 mb-10 px-2 pt-2">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                        <Logo className="text-blue-500 w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="font-bold text-2xl tracking-wider text-white">القيادة</h1>
                        <p className="text-[11px] text-blue-400 font-mono tracking-widest uppercase">مركز النظام v2.0</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 overflow-y-auto pl-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 transition-all">
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
                                    <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-e-full shadow-[0_0_10px_#3b82f6]" />
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
                        <LogOut size={20} className="rotate-180" />
                        <span className="font-medium">تسجيل الخروج</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
