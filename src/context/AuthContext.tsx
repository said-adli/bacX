"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { registerDevice, unregisterDevice } from "@/actions/device";
import { useRouter, usePathname } from "next/navigation";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserProfile {
    uid: string;
    email: string;
    fullName?: string;
    displayName?: string;
    photoURL?: string;
    wilaya?: string;
    major?: string;
    role: "admin" | "student";
    subscriptionStatus: "free" | "premium";
    isSubscribed: boolean;
    createdAt?: unknown;
    lastLogin?: unknown;
}

export interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
}

export type AuthStatus = "AUTHENTICATED" | "UNAUTHENTICATED" | "REQUIRE_ONBOARDING";

export interface SignupData {
    email: string;
    password: string;
    fullName: string;
    wilaya: string;
    major: string;
}

export interface OnboardingData {
    fullName: string;
    wilaya: string;
    major: string;
}

interface AuthContextType extends AuthState {
    // Core Auth Methods
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail: (data: SignupData) => Promise<void>;
    loginWithGoogle: () => Promise<AuthStatus>;
    completeOnboarding: (data: OnboardingData) => Promise<void>;
    logout: () => Promise<void>;

    // Utility
    role: "admin" | "student" | null;
    connectionStatus: "online" | "reconnecting" | "offline";
    isLoggingOut: boolean;
    refreshProfile: () => Promise<void>;
    
    // Check Profile / Redirection
    checkProfileStatus: (user: User, profile: UserProfile | null) => AuthStatus;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generate a stable device fingerprint for device management
 */
const getStableDeviceId = (): string => {
    if (typeof window === "undefined") return "server";
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        `${screen.width}x${screen.height}`,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency,
    ];
    const raw = components.join("||");
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = (hash * 33) ^ raw.charCodeAt(i);
    }
    return "device_" + (hash >>> 0).toString(16);
};

/**
 * Clear all client-side storage (cookies, localStorage, sessionStorage)
 */
const clearAllStorage = (): void => {
    if (typeof window === "undefined") return;

    // Clear all cookies
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }

    // Clear localStorage and sessionStorage
    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch (e) {
        console.error("Failed to clear storage:", e);
    }
};

/**
 * Set session cookie for middleware authentication
 */
const setSessionCookie = async (user: User): Promise<void> => {
    const token = await user.getIdToken();
    document.cookie = `bacx_session=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
};

/**
 * Check if a user profile is complete (has required fields)
 */
const isProfileComplete = (profile: UserProfile | null): boolean => {
    if (!profile) return false;
    // Check for essential fields
    return Boolean(profile.wilaya) && Boolean(profile.major) && Boolean(profile.fullName || profile.displayName);
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({
    children,
    initialUser,
    initialProfile,
}: {
    children: ReactNode;
    initialUser?: Partial<User> | null;
    initialProfile?: UserProfile | null;
}) {
    const router = useRouter();
    const pathname = usePathname();

    // ----- STATE -----
    const [state, setState] = useState<AuthState>({
        user: initialUser as User | null,
        profile: initialProfile || null,
        loading: !initialUser, // If we have initial data, skip loading
        error: null,
    });

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<"online" | "reconnecting" | "offline">("online");

    // Derived state
    const role = state.profile?.role || null;

    // ----- INTERNAL HELPERS -----

    /**
     * Determine Auth Status based on User and Profile
     */
    const checkProfileStatus = useCallback((user: User | null, profile: UserProfile | null): AuthStatus => {
        if (!user) return "UNAUTHENTICATED";
        if (isProfileComplete(profile)) return "AUTHENTICATED";
        return "REQUIRE_ONBOARDING";
    }, []);

    /**
     * Fetch user profile from Firestore with retry logic
     */
    const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
        const userRef = doc(db, "users", uid);
        let retries = 3;

        while (retries > 0) {
            try {
                const snap = await getDoc(userRef);
                setConnectionStatus("online");

                if (snap.exists()) {
                    return snap.data() as UserProfile;
                }
                return null;
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);

                // Permission errors - don't retry
                if (errorMessage.includes("permission-denied") || errorMessage.includes("Missing or insufficient permissions")) {
                    console.warn("⚠️ Firestore permission denied");
                    return null;
                }

                // Network errors - retry
                if (errorMessage.includes("offline") || errorMessage.includes("unavailable")) {
                    setConnectionStatus("reconnecting");
                    retries--;
                    if (retries > 0) {
                        await new Promise((r) => setTimeout(r, 2000));
                    } else {
                        setConnectionStatus("offline");
                        return null;
                    }
                } else {
                    // Unknown error - don't retry
                    console.error("Profile fetch error:", error);
                    return null;
                }
            }
        }
        return null;
    }, []);

    /**
     * Create a new user profile in Firestore
     */
    const createProfile = async (user: User, data: Partial<UserProfile>): Promise<UserProfile> => {
        const userRef = doc(db, "users", user.uid);

        const profile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            fullName: data.fullName || "",
            displayName: data.displayName || user.displayName || "",
            photoURL: data.photoURL || user.photoURL || "",
            wilaya: data.wilaya || "",
            major: data.major || "",
            role: "student",
            subscriptionStatus: "free",
            isSubscribed: false,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
        };

        await setDoc(userRef, profile);
        return profile;
    };

    /**
     * Register device for device limit management
     */
    const handleDeviceRegistration = async (uid: string): Promise<boolean> => {
        const deviceId = getStableDeviceId();
        try {
            await registerDevice(uid, {
                deviceId,
                deviceName: navigator.userAgent.slice(0, 50),
            });
            return true;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes("Device limit") || errorMessage.includes("resource-exhausted")) {
                return false; // Device limit reached
            }
            console.error("Device registration error:", error);
            return true; // Non-critical error, allow login
        }
    };

    // ----- AUTH METHODS -----

    /**
     * Login with email and password
     */
    const loginWithEmail = useCallback(async (email: string, password: string): Promise<void> => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const user = credential.user;

            // Set session cookie
            await setSessionCookie(user);

            // Check device limit
            const deviceAllowed = await handleDeviceRegistration(user.uid);
            if (!deviceAllowed) {
                await firebaseSignOut(auth);
                throw new Error("تم تجاوز حد الأجهزة المسموح به (2). يرجى تسجيل الخروج من جهاز آخر.");
            }

            // Fetch existing profile
            const profile = await fetchProfile(user.uid);

            setState({
                user,
                profile,
                loading: false,
                error: null,
            });
            
            // Redirect based on profile status
            const status = checkProfileStatus(user, profile);
            if (status === "REQUIRE_ONBOARDING") {
                router.replace("/complete-profile");
            } else {
                router.replace("/dashboard");
            }

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "فشل تسجيل الدخول";
            setState((prev) => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, [fetchProfile, checkProfileStatus, router]);

    /**
     * Sign up with email - ATOMIC FLOW
     * Creates Auth user AND Firestore profile in one operation
     */
    const signupWithEmail = useCallback(async (data: SignupData): Promise<void> => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            // Step 1: Create Firebase Auth User
            const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = credential.user;

            // Step 2: Set session cookie immediately
            await setSessionCookie(user);

            // Step 3: Create Firestore profile IMMEDIATELY (atomic)
            const profile = await createProfile(user, {
                fullName: data.fullName,
                displayName: data.fullName,
                wilaya: data.wilaya,
                major: data.major,
            });

            // Step 4: Register device
            await handleDeviceRegistration(user.uid);

            // Step 5: Update state with complete data
            setState({
                user,
                profile,
                loading: false,
                error: null,
            });

            // Step 6: Direct redirect to dashboard (Profile is guaranteed complete)
            router.replace("/dashboard");

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "فشل إنشاء الحساب";
            setState((prev) => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, [router]);

    /**
     * Login with Google - CHECK-GATE FLOW
     * If user exists -> Login
     * If new user -> Redirect to /complete-profile
     */
    const loginWithGoogle = useCallback(async (): Promise<AuthStatus> => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const provider = new GoogleAuthProvider();
            const credential = await signInWithPopup(auth, provider);
            const user = credential.user;

            // Set session cookie
            await setSessionCookie(user);

            // Check device limit
            const deviceAllowed = await handleDeviceRegistration(user.uid);
            if (!deviceAllowed) {
                await firebaseSignOut(auth);
                throw new Error("تم تجاوز حد الأجهزة المسموح به (2). يرجى تسجيل الخروج من جهاز آخر.");
            }

            // Check if profile exists in Firestore
            const existingProfile = await fetchProfile(user.uid);

            if (existingProfile && isProfileComplete(existingProfile)) {
                // Existing complete profile - update last login
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });

                setState({
                    user,
                    profile: existingProfile,
                    loading: false,
                    error: null,
                });

                router.replace("/dashboard");
                return "AUTHENTICATED";
            } else {
                // Profile missing or incomplete - needs onboarding
                setState({
                    user,
                    profile: existingProfile || null, // Don't create synthetic profile yet
                    loading: false,
                    error: null,
                });
                
                router.replace("/complete-profile");
                return "REQUIRE_ONBOARDING";
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "فشل تسجيل الدخول عبر Google";
            setState((prev) => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, [fetchProfile, router]);

    /**
     * Complete onboarding for Google users
     */
    const completeOnboarding = useCallback(async (data: OnboardingData): Promise<void> => {
        const { user } = state;
        if (!user) throw new Error("No authenticated user");

        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            // Create or Overwrite profile
            const profile = await createProfile(user, {
                fullName: data.fullName,
                displayName: data.fullName || user.displayName || "",
                photoURL: user.photoURL || "",
                wilaya: data.wilaya,
                major: data.major,
            });

            setState({
                user,
                profile,
                loading: false,
                error: null,
            });
            
            router.replace("/dashboard");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "فشل حفظ البيانات";
            setState((prev) => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, [state.user, router]);

    /**
     * Logout - Complete cleanup
     */
    const logout = useCallback(async (): Promise<void> => {
        const deviceId = getStableDeviceId();
        const currentUser = state.user;

        // Set logging out flag
        setIsLoggingOut(true);

        // Immediately clear state
        setState({
            user: null,
            profile: null,
            loading: false,
            error: null,
        });

        // Unregister device (non-blocking)
        if (currentUser) {
            try {
                await unregisterDevice(currentUser.uid, deviceId);
            } catch (error) {
                console.error("Failed to unregister device:", error);
            }
        }

        // Clear all storage
        clearAllStorage();

        // Clear server session
        try {
            await fetch("/api/logout", { method: "POST" });
        } catch {
            // Ignore errors
        }

        // Sign out from Firebase
        await firebaseSignOut(auth);

        // Hard redirect
        window.location.href = "/auth/login";

        // Reset flag after delay
        setTimeout(() => setIsLoggingOut(false), 500);
    }, [state.user]);

    /**
     * Refresh profile from Firestore
     */
    const refreshProfile = useCallback(async (): Promise<void> => {
        if (!state.user) return;

        const profile = await fetchProfile(state.user.uid);
        if (profile) {
            setState((prev) => ({ ...prev, profile }));
        }
    }, [state.user, fetchProfile]);

    // ----- EFFECTS -----

    /**
     * Main Auth State Listener
     * Handles: Page Refresh, Token Updates, Initial Load
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Skip if logging out
            if (isLoggingOut) return;

            // Skip if we already have the same user in state (optimization)
            // But if we're in "loading" state, we MUST proceed to resolve it.
            if (state.user && currentUser?.uid === state.user.uid && !state.loading && state.profile) return;

            if (currentUser) {
                // User is signed in
                try {
                    await setSessionCookie(currentUser);
                    const profile = await fetchProfile(currentUser.uid);
                    
                    setState({
                        user: currentUser,
                        profile,
                        loading: false,
                        error: null
                    });

                } catch (err) {
                    console.error("Auth state change error:", err);
                    setState({
                        user: currentUser,
                        profile: null,
                        loading: false,
                        error: "Failed to load profile"
                    });
                }
            } else {
                // No user
                setState({
                    user: null,
                    profile: null,
                    loading: false,
                    error: null,
                });
            }
        });

        return () => unsubscribe();
    }, [isLoggingOut, fetchProfile, state.user, state.loading, state.profile]);


    // ----- RENDER -----

    const value: AuthContextType = {
        ...state,
        checkProfileStatus,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        completeOnboarding,
        logout,
        role,
        connectionStatus,
        isLoggingOut,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export the context for the hook
export { AuthContext };

// Backward-compatible useAuth export (prefer importing from @/hooks/useAuth)
import { useContext } from "react";
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
