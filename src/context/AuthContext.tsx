"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";

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
    avatar_url?: string;
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
    signupWithEmail: (data: { email: string, password: string, fullName: string, wilaya: string, major: string, studySystem?: string }) => Promise<void>;
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

            // ANTI-SHARING: Update last_session_id on login/restore
            if (session?.user?.id && session?.access_token) {
                if (event === 'SIGNED_IN') {
                    const newDeviceId = crypto.randomUUID();
                    if (typeof window !== 'undefined') {
                        // Store in Session Storage (Client side checks)
                        window.sessionStorage.setItem('brainy_device_id', newDeviceId);
                        // Store in Cookie (Server side/Middleware checks) - Valid for session only
                        document.cookie = `x-device-id=${newDeviceId}; path=/; Secure; SameSite=Strict`;
                    }

                    // Update DB with this new device ID
                    supabase.from('profiles').update({
                        last_session_id: newDeviceId
                    }).eq('id', session.user.id).then(({ error }: { error: any }) => {
                        if (error) console.error("Failed to update session tracking:", error);
                    });
                } else if (event === 'INITIAL_SESSION') {
                    // Ensure cookie sync if missing?
                    const storedDeviceId = window.sessionStorage.getItem('brainy_device_id');
                    if (storedDeviceId) {
                        document.cookie = `x-device-id=${storedDeviceId}; path=/; Secure; SameSite=Strict`;
                    }
                }
            }
        });



        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchProfile]);

    // --- IDLE TIMEOUT (30 Minutes) ---
    useEffect(() => {
        if (!state.session) return;

        let timeoutId: NodeJS.Timeout;
        const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log("Creation Idle Timeout Triggered. Logging out...");
                logout();
            }, TIMEOUT_DURATION);
        };

        // Events to monitor
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        // Attach listeners
        const setupListeners = () => events.forEach(event => window.addEventListener(event, resetTimer));
        const cleanupListeners = () => events.forEach(event => window.removeEventListener(event, resetTimer));

        setupListeners();
        resetTimer(); // Start timer

        return () => {
            cleanupListeners();
            clearTimeout(timeoutId);
        };
    }, [state.session]); // Re-bind when session changes

    // --- HEARTBEAT CHECK (Anti-Sharing) ---
    useEffect(() => {
        if (!state.session || !state.user) return;

        const checkSessionValidity = async () => {
            const storedDeviceId = typeof window !== 'undefined' ? window.sessionStorage.getItem('brainy_device_id') : null;
            if (!storedDeviceId) return; // Should be set on login

            const { data, error } = await supabase
                .from('profiles')
                .select('last_session_id')
                .eq('id', state.user!.id) // Non-null assertion safe due to check above
                .single();

            if (error || !data) return;

            // Strict check
            if (data.last_session_id && data.last_session_id !== storedDeviceId) {
                console.warn("Session invalidated by newer login on another device.");
                logout();
            }
        };

        // Check every 30 seconds
        const heartbeatInterval = setInterval(checkSessionValidity, 30000);

        // Initial check
        checkSessionValidity();

        return () => clearInterval(heartbeatInterval);
    }, [state.session, state.user, supabase]);
    // --- LOGIN ---
    const loginWithEmail = async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // 1. Supabase Auth (Credentials Check)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
            throw error;
        }

        // 2. DEVICE LIMIT CHECK (Post-Auth Enforcement)
        if (data.user) {
            // Get or Create Device ID (Persistent)
            let deviceId = window.localStorage.getItem('brainy_device_id');
            if (!deviceId) {
                deviceId = crypto.randomUUID();
                window.localStorage.setItem('brainy_device_id', deviceId);
            }

            // Sync to Cookie for Middleware
            document.cookie = `x-device-id=${deviceId}; path=/; Secure; SameSite=Strict`;

            // Server Check
            const { checkAndRegisterDevice } = await import("@/actions/auth-device");
            const result = await checkAndRegisterDevice(deviceId, navigator.userAgent);

            if (!result.success) {
                console.error("Device Limit Reached:", result.error);

                // CRITICAL: Rollback (Logout immediately)
                await supabase.auth.signOut();

                setState(prev => ({
                    ...prev,
                    user: null,
                    session: null,
                    loading: false,
                    error: result.error ?? null
                }));

                // Throw error to stop UI redirect
                throw new Error(result.error);
            }
        }
    };

    const signupWithEmail = async ({ email, password, fullName, wilaya, major, studySystem }: { email: string, password: string, fullName: string, wilaya: string, major: string, studySystem?: string }) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    wilaya: wilaya,
                    major: major,
                    study_system: studySystem || "",
                    role: "student",
                    is_profile_complete: true
                }
            }
        });

        if (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
            throw error;
        }
    };

    const logout = async () => {
        // FORCE a redirect FIRST - don't wait for network
        // This ensures logout ALWAYS works even if Supabase is down
        const performRedirect = () => {
            if (typeof window !== 'undefined') {
                window.localStorage.clear();
                window.sessionStorage.clear();
                // Clear all cookies
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                // Force hard redirect - bypasses React Router completely
                window.location.href = '/';
            }
        };

        try {
            console.log("Logging out...");

            // Best-effort: Unregister Device
            const deviceId = window.localStorage.getItem('brainy_device_id');
            if (deviceId) {
                try {
                    const { unregisterDevice } = await import("@/actions/auth-device");
                    await unregisterDevice(deviceId);
                } catch (e) {
                    console.warn("Device unregister failed (non-blocking):", e);
                }
            }

            // Best-effort: Sign Out from Supabase
            try {
                await supabase.auth.signOut();
                console.log("Logged out from Supabase");
            } catch (e) {
                console.warn("Supabase signOut failed (non-blocking):", e);
            }
        } catch (error) {
            console.error("Logout error (non-blocking):", error);
        } finally {
            // ALWAYS redirect - even if everything above failed
            console.log("Force redirecting to home...");
            performRedirect();
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
