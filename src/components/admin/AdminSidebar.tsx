'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    BookOpen,
    Radio,
    Settings,
    LogOut
} from 'lucide-react';
import { Image } from 'lucide-react'; // Placeholder if we don't have Image component imported yet, but we do have Next Image
import NextImage from 'next/image';

const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Finance', href: '/admin/payments', icon: CreditCard },
    { name: 'Content', href: '/admin/content', icon: BookOpen },
    { name: 'Broadcast', href: '/admin/broadcast', icon: Radio },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-black/90 backdrop-blur-xl">
            <div className="flex h-full flex-col px-4 py-6">
                {/* Logo */}
                <div className="mb-8 flex items-center gap-3 px-2">
                    <div className="relative h-10 w-10">
                        <img
                            src="/images/brainy-logo-black.png"
                            alt="Brainy Admin"
                            className="h-full w-full object-contain"
                            style={{ filter: 'invert(1) brightness(2)' }}
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Admin<span className="text-blue-500">Panel</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600/10 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "text-blue-400" : "text-gray-500")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User Profile (Static for now) */}
                <div className="mt-auto border-t border-white/10 pt-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                            AD
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">Administrator</span>
                            <span className="text-xs text-gray-500">Super User</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
