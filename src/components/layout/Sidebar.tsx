"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, Crown, Settings, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { href: "/dashboard", label: "الرئيسية", icon: Home },
    { href: "/subjects", label: "المواد", icon: BookOpen },
    { href: "/subscription", label: "الاشتراك", icon: Crown },
    { href: "/profile", label: "الحساب", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useAuth();

    return (
        <motion.aside
            className="sidebar-floating"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
        >
            {/* Brainy Logo */}
            <Link
                href="/"
                className="nav-item mb-4 !w-12 !h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                title="Brainy"
            >
                <Brain className="w-6 h-6" />
            </Link>

            {/* Divider */}
            <div className="w-6 h-px bg-slate-200 mx-auto my-2" />

            {/* Navigation */}
            <nav className="flex flex-col">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <motion.div
                            key={item.href}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    "nav-item",
                                    isActive && "active"
                                )}
                                title={item.label}
                            >
                                <Icon className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    );
                })}

                {/* Admin Link */}
                {role === 'admin' && (
                    <>
                        <div className="w-6 h-px bg-slate-200 mx-auto my-2" />
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href="/admin"
                                prefetch={true}
                                className={cn(
                                    "nav-item",
                                    pathname.startsWith('/admin') && "active"
                                )}
                                title="لوحة التحكم"
                            >
                                <Settings className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </>
                )}
            </nav>
        </motion.aside>
    );
}
