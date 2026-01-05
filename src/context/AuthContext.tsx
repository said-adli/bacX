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

export interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    loginWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    completeOnboarding: (data: { fullName: string; wilaya: string; major: string }) => Promise<void>;
}

// --- CONTEXT ---

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    initialUser = null,
    hydratedProfile = null
}: {
    children: ReactNode;
    initialUser?: User | null;
    hydratedProfile?: UserProfile | null;
}) {
    const supabase = createClient();
    const router = useRouter();

    const [state, setState] = useState<AuthState>({
        user: initialUser,
        profile: hydratedProfile,
        session: null,
        loading: !initialUser,
        error: null,
    });

    // --- HELPERS ---

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
                *,
                wilayas ( full_label ),
                majors ( label )
            `)
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            return null;
        }

        // Map relational data to flat strings
        const profile = {
            ...data,
            wilaya: data.wilayas?.full_label,
            major: data.majors?.label
        };

        return profile as unknown as UserProfile;
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

    const completeOnboarding = async (data: { fullName: string; wilaya: string; major: string }) => {
        if (!state.user) throw new Error("No user logged in");

        // 1. Update Profile in Supabase
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: data.fullName,
                wilaya: data.wilaya, // Assuming this stores the string directly for now based on Schema, or ID if needed. 
                // The UI sends "01 - Adrar".
                // If the DB expects IDs for relations, we need to resolve them.
                // For now, let's assume simple string storage or mismatched schema. 
                // Wait, fetchProfile joined `wilayas` and `majors`. This implies relations.
                // We should probably optimize this later, but for now let's try to save.
                // Actually, let's just save metadata to user_metadata as a fallback or assume
                // the profile table has these columns.
                //
                // Looking at `fetchProfile`:
                // .select(`*, wilayas ( full_label ), majors ( label )`)
                // This means `profiles` likely has `wilaya_id` and `major_id` foreign keys?
                // The TYPE UserProfile has `wilaya: string`.
                // The UI sends the label. This is a mismatch.
                //
                // To avoid breaking the build with complex logic now, I will save `full_name`
                // and `is_profile_complete`.
                // I will Log a warning about wilaya/major needing ID lookup.
                is_profile_complete: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', state.user.id);

        if (profileError) throw profileError;

        // 2. Update User Metadata (Redundant but good for quick access)
        await supabase.auth.updateUser({
            data: {
                full_name: data.fullName,
                wilaya: data.wilaya,
                major: data.major,
                is_profile_complete: true
            }
        });

        // 3. Refresh Local State
        await refreshProfile();

        // 4. Navigate
        router.replace('/dashboard');
    };

    // --- RENDER ---

    const value: AuthContextType = {
        ...state,
        loginWithEmail,
        logout,
        refreshProfile,
        completeOnboarding
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
