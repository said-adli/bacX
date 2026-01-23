import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Video, ChevronRight, ChevronLeft, Settings, User, Sparkles } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const RightGlassSidebarComponent = function RightGlassSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const navItems = [
    { name: "الصفحة الرئيسية", href: "/dashboard", icon: Home },
    { name: "المواد", href: "/materials", icon: BookOpen },
    { name: "الحصص المباشرة", href: "/live", icon: Video },
    { name: "الملف الشخصي", href: "/profile", icon: User },
    { name: "الإعدادات", href: "/settings", icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 90 : 288 }} // Slightly wider collapsed state for the logo
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-0 top-0 h-full bg-black/80 backdrop-blur-md border-l border-white/5 flex flex-col z-[90] shadow-[-10px_0_40px_rgba(0,0,0,0.5)] overflow-visible gpu-accelerated"
    >
      {/* Toggle Button - Repositioned to prevent collision */}
      <button
        onClick={toggleCollapse}
        className="absolute top-6 left-[-12px] bg-blue-600 hover:bg-blue-500 text-white rounded-full p-1.5 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/10 transition-transform hover:scale-110 z-50"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Inner Container for Scrolling */}
      <div className="flex flex-col h-full w-full overflow-y-auto glass-scrollbar pt-6 pb-2">

        {/* Brand / Logo Area - FINAL V12.0 SINGLE IMAGE */}
        <div
          className={`w-full flex justify-center items-center pt-8 mb-12 transition-all duration-500`}
        >
          <motion.div
            layout
            className="relative z-10 flex items-center justify-center gpu-accelerated"
            animate={{
              width: 40,
              height: 40
            }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/dashboard"
              className="relative block w-full h-full cursor-pointer transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:scale-105"
            >
              <Image
                src="/images/brainy-logo-black.png"
                alt="Brainy V12.1"
                fill
                className="object-contain"
                style={{
                  filter: 'invert(1) brightness(2)',
                  animation: "energyPulse 4s ease-in-out infinite",
                }}
                priority
              />
            </Link>
          </motion.div>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.href} className="relative"
                onMouseEnter={() => isCollapsed && setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                        ${isActive
                      ? "bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/5"
                      : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                    }
                        ${isCollapsed ? 'justify-center px-0' : ''} 
                    `}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? "text-blue-400 scale-110" : "group-hover:text-blue-400 group-hover:scale-110"}`} />

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active Indicator Line */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                </Link>

                {/* Glass Tooltip (only when collapsed) */}
                <AnimatePresence>
                  {isCollapsed && hoveredItem === item.name && (
                    <motion.div
                      initial={{ opacity: 0, x: 20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 10, scale: 0.9 }}
                      className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-[60] whitespace-nowrap"
                    >
                      <span className="text-sm font-medium text-white">{item.name}</span>
                      {/* Little arrow pointing right */}
                      <div className="absolute top-1/2 -right-[4px] -translate-y-1/2 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[4px] border-l-white/10" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer / User Info */}
        <div className={`p-4 mt-auto border-t border-white/5 transition-all duration-300 ${isCollapsed ? "justify-center flex" : ""}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px] flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{profile?.full_name?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate">{profile?.full_name || "المستخدم"}</span>
                  <span className="text-xs text-white/40 truncate flex items-center gap-1">
                    {profile?.role === 'admin' ? <span className="text-yellow-400">Admin</span> : "Student"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] text-white font-bold">
                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default React.memo(RightGlassSidebarComponent);
