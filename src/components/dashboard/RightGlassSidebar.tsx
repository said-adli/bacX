"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Video, ChevronRight, ChevronLeft, Settings, User } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function RightGlassSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
      animate={{ width: isCollapsed ? 80 : 288 }} // 20px (5rem) is 80px, 72 is 288px
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-0 top-0 h-full bg-black/20 backdrop-blur-3xl border-l border-white/5 flex flex-col pt-24 pb-4 z-[90] overflow-visible shadow-[-10px_0_40px_rgba(0,0,0,0.5)]" // Higher z-index, lighter bg, deeper shadow
    >
      {/* Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute top-8 -left-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-1.5 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/10 transition-transform hover:scale-110 z-50"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand / Logo Area - V11.3 The Ultimate Refactor */}
      <div className={`px-5 mb-14 mt-8 flex items-center ${isCollapsed ? "justify-center" : "justify-start"} gap-3 overflow-visible whitespace-nowrap transition-all duration-500`}>
        {/* The Logo (Crucial Crop Hack) */}
        <motion.div
          animate={{
            // Width matches the visible pyramid width
            width: isCollapsed ? 50 : 120,
            // Height is RESTRICTED to cut off the bottom text ("Brainy" in the PNG)
            height: isCollapsed ? 50 : 90,
            scale: [1, 1.05, 1],
          }}
          transition={{
            width: { duration: 0.4, ease: "backOut" },
            height: { duration: 0.4, ease: "backOut" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative flex-shrink-0 z-10 overflow-hidden" // overflow-hidden cuts the text
        >
          <Image
            src="/images/brainy-logo-v2.png"
            alt="Brainy"
            fill
            className="object-cover" // Cover ensures it fills width, Top position keeps pyramid, cuts bottom
            style={{
              objectPosition: "top center", // Pushes the top (Pyramid) to view, hides bottom (Text)
              filter: "drop-shadow(0 0 15px rgba(59, 130, 246, 0.8)) brightness(1.2)" // Blue Energy Glow 
            }}
            priority
          />
        </motion.div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="font-sans font-black text-4xl tracking-tight bg-gradient-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl pt-1"
            >
              Brainy
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-3 space-y-2">
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
      <div className={`px-4 py-4 mt-auto border-t border-white/5 transition-opacity duration-300 ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {!isCollapsed && <p className="text-center text-[10px] text-white/20">© 2026 Brainy Education</p>}
      </div>
    </motion.aside>
  );
}
