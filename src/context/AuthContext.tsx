```javascript
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { registerDevice, unregisterDevice } from "@/actions/device";

// Stable Fingerprinting
const getStableDeviceId = () => {
    if (typeof window === 'undefined') return 'server';
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency,
    ];
    const raw = components.join('||');
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) hash = (hash * 33) ^ raw.charCodeAt(i);
    return 'device_' + (hash >>> 0).toString(16);
};

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    role: 'admin' | 'student' | null;
    connectionStatus: 'online' | 'reconnecting' | 'offline';
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    role: null,
    connectionStatus: 'online',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'student' | null>(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<'online' | 'reconnecting' | 'offline'>('online');
    const router = useRouter();

    useEffect(() => {
        // Use onIdTokenChanged to handle token refreshes automatically
        const unsubscribe = auth.onIdTokenChanged(async (currentUser) => {
            if (currentUser) {
                const token = await currentUser.getIdToken();
                const deviceId = getStableDeviceId();
                const userRef = doc(db, 'users', currentUser.uid);

                // Set the session cookie for Middleware
                document.cookie = `bacx_session = ${ token }; path =/; max-age=3600; SameSite=Lax; Secure`;

// --- RETRY LOGIC FOR NETWORK RESILIENCE ---
let retries = 3;
let success = false;

while (retries > 0 && !success) {
    try {
        const userSnap = await getDoc(userRef);
        success = true;
        setConnectionStatus('online');

        if (userSnap.exists()) {
            const data = userSnap.data();
            setRole(data.role || 'student');

            // Use Server Action for device registration (server-side enforcement)
            // Only run this occasionally or check local storage to avoid spamming? 
            // For now, we run it on every refresh to be safe, but ideally we dampen this.
            // We can rely on the server validation to be fast.
            try {
                await registerDevice(currentUser.uid, {
                    deviceId,
                    deviceName: navigator.userAgent.slice(0, 50)
                });
            } catch (deviceError: unknown) {
                // Device limit logic
                const errorMessage = deviceError instanceof Error ? deviceError.message : String(deviceError);
                if (errorMessage.includes('Device limit') || errorMessage.includes('resource-exhausted')) {
                    await firebaseSignOut(auth);
                    alert("تم تجاوز حد الأجهزة المسموح به (2).");
                    document.cookie = "bacx_session=; path=/; max-age=0";
                    setUser(null);
                    setRole(null);
                    setLoading(false);
                    return;
                }
            }
        } else {
            // First Login - create user document
            await setDoc(userRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                role: 'student',
                createdAt: new Date(),
                displayName: currentUser.displayName || "",
                photoURL: currentUser.photoURL || ""
            });
            setRole('student');
            await registerDevice(currentUser.uid, {
                deviceId,
                deviceName: navigator.userAgent.slice(0, 50)
            });
        }
        setUser(currentUser);

    } catch (error: unknown) {
        console.error("Auth Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('offline') || errorMessage.includes('unavailable')) {
            setConnectionStatus('reconnecting');
            retries--;
            await new Promise(r => setTimeout(r, 2000));
        } else {
            // Critical error
            setLoading(false);
            return;
        }
    }
}
            } else {
    // Logged out
    setUser(null);
    setRole(null);
    document.cookie = "bacx_session=; path=/; max-age=0";
}
setLoading(false);
        });

return () => unsubscribe();
    }, []);

const logout = async () => {
    const deviceId = getStableDeviceId();

    // Clear cookie first
    document.cookie = "bacx_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "bacx_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    // Call unregisterDevice Server Action
    if (user) {
        try {
            await unregisterDevice(user.uid, deviceId);
        } catch (error) {
            // Don't block logout if unregister fails
            console.error("Failed to unregister device:", error);
        }
    }

    // Clear server session
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch {
        // Ignore errors
    }

    await firebaseSignOut(auth);
    router.push('/auth');
};

return (
    <AuthContext.Provider value={{ user, loading, logout, role, connectionStatus }}>
        {!loading && children}
        {loading && (
            <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )}
    </AuthContext.Provider>
);
}

export const useAuth = () => useContext(AuthContext);
