"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

/**
 * useAuth Hook - Safe accessor for the AuthContext
 * 
 * This hook provides type-safe access to the authentication context.
 * It throws an error if used outside of an AuthProvider, ensuring
 * proper usage throughout the application.
 * 
 * @returns AuthContextType - The full authentication context
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, profile, loginWithEmail, logout } = useAuth();
 *   
 *   if (!user) return <LoginPrompt />;
 *   return <Dashboard profile={profile} />;
 * }
 * ```
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error(
            "useAuth must be used within an AuthProvider. " +
            "Make sure your component is wrapped in <AuthProvider>."
        );
    }

    return context;
}

/**
 * Type exports for external usage
 */
/**
 * Type exports for external usage
 */
export type { UserProfile, AuthState } from "@/context/AuthContext";
