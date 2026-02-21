"use client";

import { useEffect } from "react";
import { useAuth, UserProfile } from "@/context/AuthContext";

/**
 * Hydrates the client-side AuthContext with data fetched on the server.
 * This prevents the AuthContext from making a redundant read to Firestore on mount.
 */
export function AuthHydrator({ profile }: { profile: UserProfile | null }) {
    const { hydrateProfile } = useAuth();

    useEffect(() => {
        if (profile) {
            hydrateProfile(profile);
        }
    }, [profile, hydrateProfile]);

    return null; // This component renders nothing
}
