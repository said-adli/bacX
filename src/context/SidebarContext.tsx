"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMediaQuery } from "../hooks/use-media-query"; // Using relative path to fix resolution issue

interface SidebarContextType {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    isMobileOpen: boolean;
    toggleMobile: () => void;
    closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    // Default to false (expanded) on desktop
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Optional: Persist state
    useEffect(() => {
        const savedState = localStorage.getItem("sidebarCollapsed");
        if (savedState) setIsCollapsed(JSON.parse(savedState));
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            const newState = !prev;
            localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
            return newState;
        });
    };

    const toggleMobile = () => setIsMobileOpen((prev) => !prev);
    const closeMobile = () => setIsMobileOpen(false);

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, isMobileOpen, toggleMobile, closeMobile }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
