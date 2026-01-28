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
}

export interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    connectionError: boolean; // NEW: Global connection status
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

    // FAIL-SAFE INITIAL STATE: Loading is TRUE by default to prevent UI flash
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        session: null,
        loading: true,
        error: null,
        connectionError: false
    });

    const isMounted = useRef(false);

    // --- HELPER: CLEAN PROFILE FETCH ---
    const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
        console.log('👤 AuthContext: Fetching Profile for user:', userId);

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select('*')
                .eq("id", userId)
                .single();

            if (error) {
                console.error('❌ AuthContext: Profile Fetch FAILED:', error.message, error.code);
                return null;
            }

            const profile = {
                ...data,
                // Use raw IDs for now (no FK joins)
                wilaya: data.wilaya_id || "",
                major: data.major_id || "",
                is_profile_complete: !!(data.major_id && data.wilaya_id)
            };

            console.log('✅ AuthContext: Profile Loaded:', profile.id, profile.role);
            return profile;

        } catch (err: any) {
            console.error('❌ AuthContext: Profile Exception:', err.message || err);
            return null;
        }
    }, [supabase]);

    // --- MAIN AUTH LISTENER ---
    useEffect(() => {
        console.log('🔄 AuthContext: Effect Running - Initial Mount');
        isMounted.current = true;

        const initAuth = async () => {
            console.log('🔄 AuthContext: initAuth() starting...');

            try {
                // 1. Get Session directly first (faster than waiting for event)
                const { data: { session }, error } = await supabase.auth.getSession();
                console.log('🔄 AuthContext: getSession result - Session exists:', !!session, 'Error:', error?.message || 'none');

                if (error) {
                    console.error('❌ AuthContext: Session Init Error:', error);
                    // We don't return here, we let the finally block handle loading state
                    // But we should stop processing if session error
                    return;
                }

                if (session?.user) {
                    console.log('🔄 AuthContext: Session found, fetching profile for:', session.user.id);
                    const profile = await fetchProfile(session.user.id);

                    if (isMounted.current) {
                        if (profile) {
                            console.log('⏳ AuthContext: Loading State -> FALSE (profile loaded)');
                            setState(prev => ({
                                ...prev,
                                session,
                                user: session.user,
                                profile: { ...profile, email: session.user.email || profile.email }, // Safe merge
                                loading: false
                            }));
                        } else {
                            // Profile fetch failed but we have a user. 
                            // We should still allow them in (perhaps in a limited state) or just show user without profile
                            console.warn('⚠️ AuthContext: Profile missing for logged in user.');
                            setState(prev => ({
                                ...prev,
                                session,
                                user: session.user,
                                profile: null, // Allow null profile, app should handle it
                                loading: false,
                                connectionError: true // Flag this as a partial load
                            }));
                        }
                    }
                } else {
                    console.log('🔄 AuthContext: No session found');
                    // No session is a valid state, just stop loading
                }

            } catch (err) {
                console.error('💥 AuthContext: Critical Crash in initAuth:', err);
                if (isMounted.current) {
                    setState(prev => ({ ...prev, error: "Failed to initialize session.", connectionError: true }));
                }
            } finally {
                if (isMounted.current) {
                    console.log('🏁 AuthContext: initAuth finished. Force stopping loading.');
                    // use functional update to ensure we don't overwrite other parallel state changes if any (though unlikely here)
                    // But simpler: just force loading false if it's still true
                    setState(prev => ({ ...prev, loading: false }));
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            console.log(`[Auth] Event: ${event}`);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    // Update session immediately
                    setState(prev => ({ ...prev, session, user: session.user }));

                    // Fetch profile if missing or user changed
                    if (!state.user || state.user.id !== session.user.id) {
                        const profile = await fetchProfile(session.user.id);
                        if (isMounted.current) {
                            if (profile) {
                                setState(prev => ({
                                    ...prev,
                                    profile: { ...profile, email: session.user.email || profile.email }
                                }));
                            } else {
                                // Handle missing profile on auth change
                                console.warn('⚠️ AuthContext: Profile missing after auth change.');
                                setState(prev => ({
                                    ...prev,
                                    profile: null
                                }));
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
                    router.refresh(); // Clear server cache
                    router.replace('/');
                }
            }
        });

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchProfile, router]); // Removed supabase - it's a singleton but reference changes

    // --- DEBUG: SAFETY TIMEOUT ---
    useEffect(() => {
        let safetyTimer: NodeJS.Timeout;

        if (state.loading) {
            safetyTimer = setTimeout(() => {
                console.error("🚨 DEBUG: LOADER TIMED OUT! Forcing UI to render to see errors.");

                setState(prev => {
                    console.log("🚨 DEBUG STATE REPORT:", {
                        user: prev.user,
                        session: prev.session,
                        error: prev.error,
                        profile: prev.profile
                    });
                    return { ...prev, loading: false };
                });
            }, 4000);
        }

        return () => clearTimeout(safetyTimer);
    }, [state.loading]);


    // --- ACTIONS ---

    const loginWithEmail = async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error: any) {
            setState(prev => ({ ...prev, error: error.message }));
            throw error;
        } finally {
            // Always stop loading, even if auth state change handles the session update
            // We use a small timeout to allow redirect/state update to process if needed, 
            // but strictly speaking, we just need to ensure we don't hang.
            // However, strictly, if we succeed, onAuthStateChanged will handle it.
            // But if we fail, we MUST stop loading. 
            // The user requested: "ensure setLoading(false) is inside a finally block"
            // But for login success, we might want to stay loading until redirect? 
            // Actually, sticking to the request: stop spinner.
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const signupWithEmail = async (data: any) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
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
            setState(prev => ({ ...prev, error: error.message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Logout error:", error);
            // Force local cleanup anyway
            if (isMounted.current) {
                setState({ user: null, profile: null, session: null, loading: false, error: null, connectionError: false });
                router.replace('/');
            }
        }
    };

    const refreshProfile = async () => {
        if (state.user) {
            const profile = await fetchProfile(state.user.id);
            if (profile) {
                setState(prev => ({ ...prev, profile: { ...profile, email: state.user!.email! } }));
            }
        }
    };

    const completeOnboarding = async (data: { fullName: string; wilaya: string; major: string }) => {
        if (!state.user) throw new Error("No user logged in");

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

    // Hydrate profile from server-fetched data (prevents redundant DB calls)
    const hydrateProfile = useCallback((profile: UserProfile) => {
        setState(prev => ({
            ...prev,
            profile,
            loading: false
        }));
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
