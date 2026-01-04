"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// --- TYPES ---

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    wilaya?: string; // e.g., "16 - Algiers"
    major?: string;  // e.g., "science"
    role: "admin" | "student";
    is_profile_complete: boolean;
    created_at: string;
}

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    loginWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

// --- CONTEXT ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const supabase = createClient();
    const router = useRouter();

    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        session: null,
        loading: true,
        error: null,
    });

    // --- HELPERS ---

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
        return data as UserProfile;
    }, [supabase]);

    const handleNavigation = useCallback(async (profile: UserProfile | null) => {
        if (!profile) return;

        // GOAL 2: Admin Trap Fix & Verified Profile Check
        if (profile.role === 'admin') {
            router.replace("/admin");
            return;
        }

        if (profile.is_profile_complete) {
            router.replace("/dashboard");
        } else {
            router.replace("/complete-profile");
        }
    }, [router]);

    // --- EFFECTS ---

    useEffect(() => {
        // Initial Session Check
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                setState(prev => ({
                    ...prev,
                    user: session.user,
                    session,
                    profile,
                    loading: false
                }));
            } else {
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        initSession();

        // Realtime Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Optimized: Only fetch if profile missing or user changed
                if (state.user?.id !== session.user.id) {
                    const profile = await fetchProfile(session.user.id);
                    setState(prev => ({
                        ...prev,
                        user: session.user,
                        session,
                        profile,
                        loading: false
                    }));

                    // Helper: Auto-redirect on SIGN_IN if deemed appropriate
                    // (Optional: can interfere with manual navigation, but safe for 'SIGNED_IN')
                    if (event === 'SIGNED_IN') {
                        await handleNavigation(profile);
                    }
                }
            } else {
                setState({
                    user: null,
                    profile: null,
                    session: null,
                    loading: false,
                    error: null
                });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile, state.user?.id, handleNavigation]);

    // --- ACTIONS ---

    const loginWithEmail = async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
            throw error;
        }
        // State update handled by onAuthStateChange
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.replace("/auth/login");
    };

    const refreshProfile = async () => {
        if (state.user) {
            const profile = await fetchProfile(state.user.id);
            setState(prev => ({ ...prev, profile }));
        }
    };

    // --- RENDER ---

    const value: AuthContextType = {
        ...state,
        loginWithEmail,
        logout,
        refreshProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
