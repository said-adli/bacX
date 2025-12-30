"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, Crown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { href: "/dashboard", label: "الرئيسية", icon: Home },
    { href: "/subjects", label: "دروسي", icon: BookOpen },
    { href: "/subscription", label: "اشتراكي", icon: Crown },
    { href: "/profile", label: "حسابي", icon: User },
    // { href: "/support", label: "الدعم", icon: HelpCircle },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth(); // If you need logout here, though usually it's in TopNav or Profile

    return (
        <aside className="fixed right-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-l border-blue-100/50 flex flex-col z-50 transition-all duration-300 shadow-xl shadow-blue-900/5">
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-center border-b border-blue-50/50">
                <Link href="/" className="flex items-center gap-2">
                    {/* Replaced Text Logo with simple BacX text for now, match landing page logo if image available */}
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">B</div>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">bac<span className="text-blue-600">X</span></span>
                </Link>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-100">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group font-medium text-sm",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 translate-x-[-4px]"
                                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/80"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Sidebar Promo or Footer */}
            <div className="p-4 m-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600">
                    <Crown className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">النسخة المدفوعة</h4>
                <p className="text-xs text-slate-500 mb-3">احصل على وصول كامل للدروس</p>
                <Link href="/subscription" className="block w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition">
                    ترقية حسابي
                </Link>
            </div>
        </aside>
    );
}
