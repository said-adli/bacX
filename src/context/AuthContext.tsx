"use client";

import { createContext, useContext, ReactNode } from "react";

// Placeholder for Supabase Auth Context
interface AuthContextType {
    // To be implemented
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
