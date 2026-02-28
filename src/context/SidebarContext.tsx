"use client";

import { createContext, useContext, useState, ReactNode, useSyncExternalStore } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    isMobileOpen: boolean;
    toggleMobile: () => void;
    closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// External store for localStorage sync
function subscribeToStorage(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

function getCollapsedState(): boolean {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
    // Use useSyncExternalStore for localStorage to avoid setState in effect
    const storedCollapsed = useSyncExternalStore(
        subscribeToStorage,
        getCollapsedState,
        () => false // Server snapshot
    );

    const [isCollapsed, setIsCollapsed] = useState(storedCollapsed);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

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
