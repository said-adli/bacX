"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
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
    is_subscribed?: boolean;
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
    signupWithEmail: (data: { email: string, password: string, fullName: string, wilaya: string, major: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    hydrateProfile: (profile: UserProfile | null) => Promise<void>;
    checkProfileStatus: () => Promise<boolean>;
    completeOnboarding: (data: { fullName: string; wilaya: string; major: string }) => Promise<void>;
    role: "admin" | "student" | null; // Direct Accessor
}

// ... CONTEXT ...
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

    // handleNavigation was unused and causing lint warnings.
    // Logic for redirection is now handled in components or middleware if needed.

    // ... EFFECTS ...

    // ... ACTIONS ...

    const loginWithEmail = async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
            throw error;
        }
    };

    const signupWithEmail = async ({ email, password, fullName, wilaya, major }: { email: string, password: string, fullName: string, wilaya: string, major: string }) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    wilaya: wilaya,
                    major: major,
                    is_profile_complete: true // Assuming sign up flow includes all data
                }
            }
        });

        if (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
            throw error;
        }

        // Note: Profile creation is usually handled by a Database Trigger on "auth.users" created.
        // Assuming trigger exists. If not, we might need manual insert here, but Trigger is Supabase best practice.
    };

    const logout = async () => {
        console.log("Logging out...");
        await supabase.auth.signOut();
        console.log("Logged out from Supabase, redirecting...");
        router.replace("/login");
    };

    const refreshProfile = async () => {
        if (state.user) {
            const profile = await fetchProfile(state.user.id);
            setState(prev => ({ ...prev, profile }));
        }
    };

    const hydrateProfile = async (profile: UserProfile | null) => {
        setState(prev => ({ ...prev, profile }));
    };

    const checkProfileStatus = async () => {
        if (!state.user) return false;
        // If we have local profile, check it
        if (state.profile) return state.profile.is_profile_complete;

        // Otherwise fetch
        const profile = await fetchProfile(state.user.id);
        return profile?.is_profile_complete || false;
    };

    const completeOnboarding = async (data: { fullName: string; wilaya: string; major: string }) => {
        if (!state.user) throw new Error("No user logged in");

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: data.fullName,
                wilaya: data.wilaya,
                // major: data.major, // DB might expect IDs. Keeping metadata sync for checks.
                is_profile_complete: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', state.user.id);

        if (profileError) throw profileError;

        await supabase.auth.updateUser({
            data: {
                full_name: data.fullName,
                wilaya: data.wilaya,
                major: data.major,
                is_profile_complete: true
            }
        });

        await refreshProfile();
        router.replace('/dashboard');
    };

    // --- RENDER ---

    const value: AuthContextType = {
        ...state,
        loginWithEmail,
        signupWithEmail,
        logout,
        refreshProfile,
        hydrateProfile,
        checkProfileStatus,
        completeOnboarding,
        role: state.profile?.role || null
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
