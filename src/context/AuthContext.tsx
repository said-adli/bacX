"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// --- TYPES ---

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    wilaya?: string; // e.g., "16 - Algiers"
    major?: string;  // e.g., "science"
    study_system?: string; // e.g., "regular" or "private"
    role: "admin" | "student";
    is_profile_complete: boolean;
    is_subscribed?: boolean;
    subscription_end_date?: string;
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
        loading: false, // OPTIMISTIC: Never block UI on auth - trust SSR hydration
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

    // Track if we've completed initial auth check
    const hasInitialized = useRef(!!initialUser);
    // Track current user ID to avoid duplicate fetches
    const userIdRef = useRef<string | undefined>(initialUser?.id);

    useEffect(() => {
        // BACKGROUND AUTH LISTENER: Never blocks navigation
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            // Skip INITIAL_SESSION if we already have SSR data
            if (event === 'INITIAL_SESSION' && hasInitialized.current) {
                // Just sync the session object, don't re-fetch profile
                if (session) {
                    setState(prev => ({ ...prev, session }));
                }
                return;
            }

            if (session?.user) {
                const user = session.user;

                if (!hasInitialized.current) {
                    // First client-side auth - silently hydrate
                    hasInitialized.current = true;
                    userIdRef.current = user.id;
                    const profile = await fetchProfile(user.id);
                    setState(prev => ({ ...prev, user, session, profile }));
                } else if (user.id !== userIdRef.current) {
                    // User actually changed (rare: account switch)
                    userIdRef.current = user.id;
                    const profile = await fetchProfile(user.id);
                    setState(prev => ({ ...prev, user, session, profile }));
                } else {
                    // Same user, just session refresh - update session only
                    setState(prev => ({ ...prev, session }));
                }
            } else if (hasInitialized.current && userIdRef.current) {
                // Actual logout (not initial empty state)
                userIdRef.current = undefined;
                setState(prev => ({
                    ...prev,
                    user: null,
                    session: null,
                    profile: null
                }));
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile]);
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
        try {
            console.log("Logging out...");
            // Attempt to sign out from Supabase
            await supabase.auth.signOut();
            console.log("Logged out from Supabase success");
        } catch (error) {
            console.error("Logout error (non-blocking):", error);
        } finally {
            // ALWAYS Redirect, even if error occurs
            console.log("Redirecting to login...");
            router.push("/login"); // Client-side nav
            router.refresh();      // Clear server cache
        }
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
