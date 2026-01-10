"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Video } from "lucide-react";

export default function RightGlassSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "الصفحة الرئيسية", href: "/dashboard", icon: Home },
    { name: "المواد", href: "/materials", icon: BookOpen },
    { name: "الحصص المباشرة", href: "/live", icon: Video },
  ];

  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-white/5 backdrop-blur-xl border-l border-white/10 flex flex-col pt-20 pb-4 z-50">
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${
                  isActive
                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "group-hover:text-blue-400"}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 text-center text-xs text-white/20">
        <p>© 2026 Brainy</p>
      </div>
    </aside>
  );
}
