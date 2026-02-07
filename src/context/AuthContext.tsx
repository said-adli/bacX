"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// --- TYPES ---

// Enriched Profile Interface (Strict Schema Sync)
export interface EnrichedProfile {
    // Core Profile Fields
    id: string;
    email: string;
    full_name: string;
    wilaya_id?: number;
    major_id?: string;
    role: "admin" | "student";
    is_profile_complete: boolean;
    is_subscribed: boolean;
    subscription_end_date?: string;
    plan_id?: string;
    created_at: string;

    // Relational Fields (Hydrated)
    majors?: { label: string };
    wilayas?: { name_ar: string; name_en: string };
    subscription_plans?: { name: string };

    // Flattened / Derived Fields (Frontend Compatibility)
    name?: string;       // Alias for full_name
    major?: string;      // Alias for majors.label
    wilaya?: string;     // Alias for wilayas.name_ar || wilayas.name_en
    plan_name?: string;  // Alias for subscription_plans.name

    // Legacy / Optional
    avatar_url?: string;
}

export type UserProfile = EnrichedProfile;

export interface AuthState {
    user: User | null;
    profile: EnrichedProfile | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    connectionError: boolean;
}

export interface AuthContextType extends AuthState {
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail: (data: { email: string, password: string, fullName: string, wilaya: string, major: string, studySystem?: string }) => Promise<void>;
    completeOnboarding: (data: { fullName: string; wilaya: string; major: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    hydrateProfile: (profile: EnrichedProfile) => void;
    role: "admin" | "student" | null;
}

// --- CONTEXT ---
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children
}: {
    children: ReactNode;
}) {
    const supabase = createClient();
    const router = useRouter();

    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        session: null,
        loading: true,
        error: null,
        connectionError: false
    });

    const isMounted = useRef(false);
    const profileRef = useRef<EnrichedProfile | null>(null);

    // Keep ref strict synced
    useEffect(() => {
        profileRef.current = state.profile;
    }, [state.profile]);

    // --- FETCH STRATEGY: SINGLE RELATIONAL JOIN ---
    const fetchProfile = useCallback(async (userId: string): Promise<EnrichedProfile | null> => {
        try {
            // RELATIONAL HYDRATION: Single Query
            const { data: rawProfile, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    majors ( label ),
                    wilayas ( name_ar, name_en ),
                    subscription_plans ( name )
                `)
                .eq('id', userId)
                .single();

            if (error) {
                console.error("❌ Profile Sync Error:", error.message);
                throw error;
            }

            if (!rawProfile) {
                throw new Error("Profile Not Found");
            }

            // Map to EnrichedProfile (Strict Type Mapping)
            // Ensure no 'any' is used. We verify properties existence.
            const profile: EnrichedProfile = {
                id: rawProfile.id,
                email: rawProfile.email,
                full_name: rawProfile.full_name,
                wilaya_id: rawProfile.wilaya_id,
                major_id: rawProfile.major_id,
                role: rawProfile.role,
                is_profile_complete: rawProfile.is_profile_complete,
                is_subscribed: rawProfile.is_subscribed,
                subscription_end_date: rawProfile.subscription_end_date,
                plan_id: rawProfile.plan_id,
                created_at: rawProfile.created_at,

                // Relations
                majors: rawProfile.majors,
                wilayas: rawProfile.wilayas,
                subscription_plans: rawProfile.subscription_plans,

                // Mapped Aliases
                name: rawProfile.full_name,
                major: rawProfile.majors?.label,
                wilaya: rawProfile.wilayas?.name_ar || rawProfile.wilayas?.name_en,
                plan_name: rawProfile.subscription_plans?.name,

                avatar_url: rawProfile.avatar_url
            };

            return profile;

        } catch (err: unknown) {
            console.error("💥 Auth Connection Failed:", err);
            return null;
        }
    }, [supabase]);

    // --- MAIN INITIALIZATION EFFECT ---
    useEffect(() => {
        isMounted.current = true;

        const initAuth = async () => {
            try {
                // 1. Get Session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    try {
                        const profile = await fetchProfile(session.user.id);

                        if (isMounted.current) {
                            if (profile) {
                                setState(prev => ({
                                    ...prev,
                                    session,
                                    user: session.user,
                                    profile: { ...profile, email: session.user.email || profile.email },
                                    loading: false,
                                    error: null,
                                    connectionError: false
                                }));
                            } else {
                                // Profile NULL = Error State
                                console.error("⚠️ Profile Null (Init)");
                                setState(prev => ({
                                    ...prev,
                                    session,
                                    user: session.user,
                                    profile: null,
                                    loading: false,
                                    connectionError: true
                                }));
                            }
                        }
                    } catch (fetchErr) {
                        console.error("⚠️ Init Profile Error:", fetchErr);
                        if (isMounted.current) {
                            setState(prev => ({
                                ...prev,
                                session,
                                user: session.user,
                                profile: null,
                                loading: false,
                                connectionError: true
                            }));
                        }
                    }
                } else {
                    if (isMounted.current) {
                        setState(prev => ({ ...prev, loading: false }));
                    }
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Auth initialization failed";
                console.error("💥 Init Crash:", err);
                if (isMounted.current) {
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: message
                    }));
                }
            }
        };

        // Run Init
        initAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            if (!isMounted.current) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                if (session?.user) {
                    // Optimistic
                    setState(prev => ({ ...prev, session, user: session.user }));

                    if (event === 'SIGNED_IN' || !profileRef.current || profileRef.current.id !== session.user.id) {
                        try {
                            const profile = await fetchProfile(session.user.id);
                            if (isMounted.current) {
                                if (profile) {
                                    setState(prev => ({
                                        ...prev,
                                        profile: { ...profile, email: session.user.email || profile.email },
                                        loading: false,
                                        error: null
                                    }));
                                } else {
                                    setState(prev => ({
                                        ...prev,
                                        profile: null,
                                        loading: false,
                                        connectionError: true
                                    }));
                                }
                            }
                        } catch (err) {
                            if (isMounted.current) {
                                setState(prev => ({ ...prev, loading: false, connectionError: true }));
                            }
                        }
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                if (isMounted.current) {
                    setState({
                        user: null,
                        profile: null,
                        session: null,
                        loading: false,
                        error: null,
                        connectionError: false
                    });
                    router.replace('/');
                    router.refresh();
                }
            }
        });

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile, router]);

    // --- ACTIONS ---

    const loginWithEmail = async (email: string, password: string) => {
        if (isMounted.current) setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Login failed";
            console.error("Login Error:", error);
            if (isMounted.current) {
                setState(prev => ({ ...prev, loading: false, error: message }));
            }
            throw error;
        }
    };

    interface SignupData {
        email: string;
        password: string;
        fullName: string;
        wilaya: string;
        major: string;
        studySystem?: string;
    }

    const signupWithEmail = async (data: SignupData) => {
        if (isMounted.current) setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        wilaya: data.wilaya,
                        major: data.major,
                        role: "student"
                    }
                }
            });
            if (error) throw error;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Signup failed";
            if (isMounted.current) {
                setState(prev => ({ ...prev, error: message }));
            }
            throw error;
        } finally {
            if (isMounted.current) setState(prev => ({ ...prev, loading: false }));
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } finally {
            if (isMounted.current) {
                setState({ user: null, profile: null, session: null, loading: false, error: null, connectionError: false });
                router.replace('/');
            }
        }
    };

    const refreshProfile = async () => {
        if (!state.user) return;
        const profile = await fetchProfile(state.user.id);
        if (isMounted.current && profile) {
            setState(prev => ({ ...prev, profile: { ...profile, email: state.user!.email! } }));
        }
    };

    const completeOnboarding = async (data: { fullName: string; wilaya: string; major: string }) => {
        if (!state.user) throw new Error("No user logged in");

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: data.fullName,
                wilaya_id: parseInt(data.wilaya),
                major_id: data.major,
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

    const hydrateProfile = useCallback((profile: EnrichedProfile) => {
        if (isMounted.current) {
            setState(prev => ({
                ...prev,
                profile,
                loading: false
            }));
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            ...state,
            loginWithEmail,
            signupWithEmail,
            logout,
            refreshProfile,
            hydrateProfile,
            completeOnboarding,
            role: state.profile?.role || null
        }}>
            {state.connectionError && (
                <div className="bg-red-500/10 border-b border-red-500/20 text-red-500 px-4 py-2 text-center text-sm font-bold animate-pulse">
                    Connection Interrupted. Some data may be unavailable.
                </div>
            )}
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
