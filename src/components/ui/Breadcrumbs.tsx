// Server Component

import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav className={cn("flex items-center space-x-2 space-x-reverse text-sm text-zinc-400 mb-6", className)}>
            <Link
                href="/dashboard"
                className="hover:text-white transition-colors flex items-center gap-1 p-1 hover:bg-white/5 rounded-md"
            >
                <Home size={14} />
                <span>الرئيسية</span>
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={index} className="flex items-center">
                        <ChevronLeft size={14} className="mx-1 text-zinc-600" />

                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="hover:text-white transition-colors px-2 py-1 hover:bg-white/5 rounded-md"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={cn("px-2 py-1 font-medium", isLast ? "text-white bg-white/5 rounded-md border border-white/5" : "")}>
                                {item.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
