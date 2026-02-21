"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface ProfileData {
    id: string;
    email: string | null;
    full_name: string;
    wilaya_id: string;
    major_id: string;
    majors: { name: string } | null;
    branches?: { id: string, name: string } | null;
    wilayas?: { id: number, name_ar: string, name_en: string } | null;
    major_name: string;
    wilaya_name: string;
    study_system: string;
    bio: string;
    role: string;
    avatar_url: string;
}

interface UseProfileDataResult {
    profile: ProfileData | null;
    loading: boolean;
    error: string | null;
    retry: () => void;
}

export function useProfileData(): UseProfileDataResult {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    const fetchProfile = useCallback(async () => {
        if (!isMountedRef.current) return;

        setLoading(true);
        setError(null);

        const supabase = createClient();

        try {
            // Step 1: Get authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error('[useProfileData] Auth Error:', authError.message);
                throw new Error(authError.message);
            }

            if (!user) {
                throw new Error("No authenticated user");
            }

            // Fetching profile (log removed)

            // Step 2: Profile fetch with FK joins
            // User requested explicit branches(id, name) join.
            // We assume major_id matches to branches table or there is a configured relation.
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('*, branches(id, name), wilayas(id, name_ar, name_en)')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('[useProfileData] Profile Error:', profileError.message, profileError.code);
                throw new Error(profileError.message);
            }

            // Raw data loaded (log removed)

            // Step 3: Build profile object
            const majorName = (data?.branches as { name?: string } | null)?.name || "غير محدد"; // Default from join

            const profileData: ProfileData = {
                id: user.id,
                email: user.email || null,
                full_name: data?.full_name || "",
                wilaya_id: data?.wilaya_id || "",
                major_id: data?.major_id || "",
                majors: null,
                major_name: majorName,
                wilaya_name: data?.wilaya_id || "", // Will be formatted in UI using helper
                study_system: data?.study_system || "",
                bio: data?.bio || "",
                role: data?.role || "student",
                avatar_url: data?.avatar_url || "",
                // Store relationships
                branches: data?.branches || null,
                wilayas: data?.wilayas || null
            };

            if (isMountedRef.current) {
                setProfile(profileData);
                // Profile loaded (log removed)
            }

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('[useProfileData] ❌ Error:', errorMessage);
            if (isMountedRef.current) {
                setError(errorMessage);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        fetchProfile();

        return () => {
            isMountedRef.current = false;
        };
    }, [fetchProfile]);

    const retry = useCallback(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, error, retry };
}
