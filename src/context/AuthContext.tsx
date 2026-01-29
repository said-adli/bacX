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
    wilaya_id?: string;
    wilaya?: string;
    major_id?: string;
    major?: string;
    study_system?: string;
    role: "admin" | "student";
    is_profile_complete: boolean;
    is_subscribed?: boolean;
    subscription_end_date?: string;
    avatar_url?: string;
    created_at: string;
    last_session_id?: string;
    // Extended properties
    major_name?: string;
    wilaya_name?: string;
}

export interface AuthState {
    user: User | null;
    profile: UserProfile | null;
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
    hydrateProfile: (profile: UserProfile) => void;
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

    // FAIL-SAFE INITIAL STATE: Loading is TRUE by default
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        session: null,
        loading: true,
        error: null,
        connectionError: false
    });

    const isMounted = useRef(false);

    // --- FETCH STRATEGY: SPLIT FETCH (ROBUST) ---
    /*
    const fetchProfile = useCallback(async (userId: string) => {
        try {
            console.log("👤 AuthContext: Step 1 - Fetching Profile Row...");

            // STEP 1: Fetch Profile Row ONLY
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("❌ Profile Error:", error.message);
                throw new Error(`Profile fetch failed: ${error.message}`);
            }

            if (!profile) {
                console.error("❌ Profile Missing for ID:", userId);
                throw new Error("Profile Not Found");
            }

            // STEP 2: Fetch Foreign Key Details in Parallel
            let majorName = null;
            let wilayaName = null;
            const promises = [];

            if (profile.major_id) {
                promises.push(
                    supabase.from('majors').select('label').eq('id', profile.major_id).single()
                        .then(({ data }: { data: any }) => { if (data) majorName = data.label; })
                        .catch((err: any) => console.warn("⚠️ Failed to fetch major:", err))
                );
            }

            if (profile.wilaya_id) {
                promises.push(
                    supabase.from('wilayas').select('full_label').eq('id', profile.wilaya_id).single()
                        .then(({ data }: { data: any }) => { if (data) wilayaName = data.full_label; })
                        .catch((err: any) => console.warn("⚠️ Failed to fetch wilaya:", err))
                );
            }

            await Promise.all(promises);

            // STEP 3: Merge and Return
            // We cast to any to safely add extended properties without TS yelling
            // ensuring the base structural integrity matches UserProfile
            const finalProfile = {
                ...profile,
                major_name: majorName,
                wilaya_name: wilayaName
            } as any;

            console.log("✅ Profile Loaded:", finalProfile);
            return finalProfile;

        } catch (err) {
            console.error("💥 Critical Fetch Error:", err);
            // We do NOT return fake data. We let the caller handle the failure.
            throw err;
        }
    }, [supabase]);
    */

    // 🛑 DEBUG MODE: STATIC BYPASS
    // This function ignores Supabase and returns instant mock data
    const fetchProfile = useCallback(async (userId: string) => {
        console.log("🚀 DEBUG: Bypassing Database Connection...");

        // Return a valid mock object immediately
        return {
            id: userId,
            full_name: "Debug User (No DB)",
            name: "Debug User (No DB)",
            role: "student",
            email: "debug@test.com",
            avatar: null,
            major_id: null,
            wilaya_id: null,
            major_name: "Static Major",
            wilaya_name: "Static Wilaya",
            // Mandatory fields for TS
            is_profile_complete: true,
            created_at: new Date().toISOString()
        } as any;
    }, []);

    // --- MAIN INITIALIZATION EFFECT ---
    useEffect(() => {
        console.log('🔄 AuthContext: Mount');
        isMounted.current = true;

        const initAuth = async () => {
            console.log('🔄 AuthContext: initAuth()');
            try {
                // 1. Get Session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    console.log('🔄 AuthContext: Session found. Fetching profile...');
                    try {
                        const profile = await fetchProfile(session.user.id);

                        if (isMounted.current) {
                            setState(prev => ({
                                ...prev,
                                session,
                                user: session.user,
                                profile: { ...profile, email: session.user.email || profile.email },
                                loading: false,
                                error: null,
                                connectionError: false
                            }));
                        }
                    } catch (fetchErr) {
                        console.error("⚠️ AuthContext: Failed to load profile for valid session.", fetchErr);
                        if (isMounted.current) {
                            // User is valid, but profile failed. 
                            // We treat this as a semi-authenticated state or connection error.
                            setState(prev => ({
                                ...prev,
                                session,
                                user: session.user,
                                profile: null,
                                loading: false, // STOP SPINNER
                                connectionError: true
                            }));
                        }
                    }
                } else {
                    console.log('🔄 AuthContext: No session.');
                    if (isMounted.current) {
                        setState(prev => ({ ...prev, loading: false }));
                    }
                }
            } catch (err: any) {
                console.error("💥 AuthContext: initAuth crashed:", err);
                if (isMounted.current) {
                    setState(prev => ({
                        ...prev,
                        loading: false, // GUARANTEED TERMINATION
                        error: err.message || "Initialization Failed"
                    }));
                }
            }
        };

        // Run Init
        initAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            console.log(`[Auth] Event: ${event}`);

            if (!isMounted.current) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                if (session?.user) {
                    // Optimistic update of session
                    setState(prev => ({ ...prev, session, user: session.user }));

                    // Fetch profile if we don't have it or if user ID changed
                    // (Or if we just want to ensure freshness on sign-in)
                    if (event === 'SIGNED_IN' || !state.profile || state.profile.id !== session.user.id) {
                        try {
                            const profile = await fetchProfile(session.user.id);
                            if (isMounted.current) {
                                setState(prev => ({
                                    ...prev,
                                    profile: { ...profile, email: session.user.email || profile.email },
                                    loading: false,
                                    error: null
                                }));
                            }
                        } catch (err) {
                            console.error("⚠️ AuthContext: Profile fetch failed on AuthChange.", err);
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
                        loading: false, // GUARANTEED TERMINATION
                        error: null,
                        connectionError: false
                    });
                    router.replace('/');
                    router.refresh();
                }
            }
        });

        return () => {
            console.log('🔄 AuthContext: Unmount');
            isMounted.current = false;
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile, router]); // Fixed: Removed state.profile to prevent loop


    // --- ACTIONS ---

    const loginWithEmail = async (email: string, password: string) => {
        if (isMounted.current) setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // Native auth change listener will handle the rest
        } catch (error: any) {
            console.error("Login Error:", error);
            if (isMounted.current) {
                setState(prev => ({ ...prev, loading: false, error: error.message }));
            }
            throw error;
        }
        // No finally block needed here because:
        // 1. If success: onAuthStateChange handles loading -> false
        // 2. If error: catch block handles loading -> false
        // 3. We don't want to prematurely set loading=false if successful before the profile fetch completes in the listener
    };

    const signupWithEmail = async (data: any) => {
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
        } catch (error: any) {
            console.error("Signup Error:", error);
            if (isMounted.current) {
                setState(prev => ({ ...prev, error: error.message }));
            }
            throw error;
        } finally {
            // For signup, we usually want to stop loading to show "Check your email" or similar
            if (isMounted.current) setState(prev => ({ ...prev, loading: false }));
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Force local cleanup
            if (isMounted.current) {
                setState({ user: null, profile: null, session: null, loading: false, error: null, connectionError: false });
                router.replace('/');
            }
        }
    };

    const refreshProfile = async () => {
        if (!state.user) return;
        try {
            const profile = await fetchProfile(state.user.id);
            if (isMounted.current && profile) {
                setState(prev => ({ ...prev, profile: { ...profile, email: state.user!.email! } }));
            }
        } catch (err) {
            console.error("Refresh profile failed", err);
        }
    };

    const completeOnboarding = async (data: { fullName: string; wilaya: string; major: string }) => {
        if (!state.user) throw new Error("No user logged in");

        // Direct update
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: data.fullName,
                wilaya_id: data.wilaya,
                major_id: data.major,
                is_profile_complete: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', state.user.id);

        if (profileError) throw profileError;

        // Update Auth Metadata as well
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

    const hydrateProfile = useCallback((profile: UserProfile) => {
        if (isMounted.current) {
            setState(prev => ({
                ...prev,
                profile,
                loading: false
            }));
        }
    }, []);

    // --- RENDER ---
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
            {/* GLOBAL CONNECTION ERROR BANNER */}
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
