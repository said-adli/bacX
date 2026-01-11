"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Video, ChevronRight, ChevronLeft, Menu, LogOut } from "lucide-react";
import { useState } from "react";

import { createClient } from "@/utils/supabase/client";

export default function RightGlassSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navItems = [
    { name: "الصفحة الرئيسية", href: "/dashboard", icon: Home },
    { name: "المواد", href: "/materials", icon: BookOpen },
    { name: "الحصص المباشرة", href: "/live", icon: Video },
  ];

  return (

    <aside
      className={`fixed right-0 top-0 h-full bg-black/40 backdrop-blur-2xl border-l border-white/5 flex flex-col pt-24 pb-4 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCollapsed ? "w-20" : "w-72"
        }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -left-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-1.5 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/10 transition-all z-50"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand / Logo Area */}
      <div className={`px-6 mb-8 flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <span className="font-bold text-white text-lg">B</span>
        </div>
        {!isCollapsed && (
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent animate-in fade-in duration-300">
            Brainy
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                ${isActive
                  ? "bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/5"
                  : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                }
              `}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-blue-400 scale-110" : "group-hover:text-blue-400 group-hover:scale-110"}`} />

              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap animate-in slide-in-from-right-2 duration-300">
                  {item.name}
                </span>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="px-3 mt-2 pt-2 border-t border-white/5 mx-4 relative z-[9999]">
        <button
          onClick={handleLogout}
          className={`w-full relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden text-red-400/70 hover:text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] cursor-pointer active:scale-95`}
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          {!isCollapsed && (
            <span className="font-medium whitespace-nowrap animate-in slide-in-from-right-2 duration-300">
              تسجيل الخروج
            </span>
          )}
        </button>
      </div>

      {/* Footer / User Info */}
      <div className={`px-4 py-4 mt-auto border-t border-white/5 transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
        {!isCollapsed && <p className="text-center text-[10px] text-white/20">© 2026 Brainy Education</p>}
      </div>
    </aside>

  );
}
