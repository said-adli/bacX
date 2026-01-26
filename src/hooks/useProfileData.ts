"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface ProfileData {
    id: string;
    email: string | null;
    full_name: string;
    wilaya_id: string;
    major_id: string;
    // Nested relation objects from FK joins
    majors: { name: string } | null;
    wilayas: { name: string } | null;
    // Computed display names (human-readable)
    major_name: string;
    wilaya_name: string;
    study_system: string;
    bio: string;
    role: string;
    avatar_url: string;
}

interface UseProfileDataOptions {
    timeoutMs?: number;
    maxRetries?: number;
}

interface UseProfileDataResult {
    profile: ProfileData | null;
    loading: boolean;
    error: string | null;
    isAccessDenied: boolean;
    retry: () => void;
}

export function useProfileData(
    options: UseProfileDataOptions = {}
): UseProfileDataResult {
    const { timeoutMs = 10000, maxRetries = 3 } = options;

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAccessDenied, setIsAccessDenied] = useState(false);

    const retryCountRef = useRef(0);
    const isMountedRef = useRef(true);

    const fetchProfile = useCallback(async () => {
        if (!isMountedRef.current) return;

        setLoading(true);
        setError(null);
        setIsAccessDenied(false);

        const supabase = createClient();

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("CONNECTION_TIMEOUT")), timeoutMs);
        });

        try {
            // Step 1: Get authenticated user (required)
            const authResult = await Promise.race([
                supabase.auth.getUser(),
                timeoutPromise
            ]);

            const { data: { user: authUser }, error: authError } = authResult;

            if (authError || !authUser) {
                throw new Error("AUTH_FAILED");
            }

            // Step 2: Fetch profile with FK joins for human-readable names
            const profileResult = await Promise.race([
                supabase
                    .from('profiles')
                    .select('*, majors(name), wilayas(name)')
                    .eq('id', authUser.id)
                    .maybeSingle(),
                timeoutPromise
            ]);

            const { data: profileData, error: profileError } = profileResult;

            // Step 3: Handle RLS/Permission errors (Silent 403 protection)
            if (profileError) {
                if (profileError.code === '42501' ||
                    profileError.code === 'PGRST301') {
                    setIsAccessDenied(true);
                    throw new Error("ACCESS_DENIED");
                }
                throw new Error(profileError.message);
            }

            // Step 4: Build profile with human-readable names from FK joins
            const metadata = authUser.user_metadata || {};
            const mergedProfile: ProfileData = {
                id: authUser.id,
                email: authUser.email || null,
                full_name: profileData?.full_name || metadata.full_name || "",
                // Raw IDs
                wilaya_id: profileData?.wilaya_id || "",
                major_id: profileData?.major_id || "",
                // Nested relation objects
                majors: profileData?.majors || null,
                wilayas: profileData?.wilayas || null,
                // Human-readable names (computed from FK joins)
                major_name: profileData?.majors?.name || metadata.major || "",
                wilaya_name: profileData?.wilayas?.name || metadata.wilaya || "",
                study_system: profileData?.study_system || metadata.study_system || "",
                bio: profileData?.bio || "",
                role: profileData?.role || "student",
                avatar_url: profileData?.avatar_url || metadata.avatar_url || "",
            };

            if (isMountedRef.current) {
                setProfile(mergedProfile);
                setLoading(false); // ✅ Set loading false on success
                retryCountRef.current = 0; // Reset on success
                console.log('[useProfileData] ✅ Profile loaded successfully');
            }

        } catch (err: any) {
            if (!isMountedRef.current) return;

            const errorMessage = err.message || "UNKNOWN_ERROR";
            console.log('[useProfileData] Error:', errorMessage);

            // Auto-retry with exponential backoff (except for auth/access errors)
            if (retryCountRef.current < maxRetries &&
                errorMessage !== "ACCESS_DENIED" &&
                errorMessage !== "AUTH_FAILED") {

                retryCountRef.current++;
                const delay = Math.pow(2, retryCountRef.current) * 1000;

                console.log(`[useProfileData] Retry ${retryCountRef.current}/${maxRetries} in ${delay}ms`);

                setTimeout(() => {
                    if (isMountedRef.current) fetchProfile();
                }, delay);
                // Keep loading=true during retries, don't fall through to finally
                return;
            }

            // Only set error if retries exhausted or critical error
            setError(errorMessage);
            setLoading(false); // Explicitly set loading false on final error
        } finally {
            // Only set loading false here if we didn't return early (retry case)
            // This is handled by the success path
            if (isMountedRef.current && retryCountRef.current >= maxRetries) {
                setLoading(false);
            }
        }
    }, [timeoutMs, maxRetries]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchProfile();

        return () => {
            isMountedRef.current = false;
        };
    }, [fetchProfile]);

    const retry = useCallback(() => {
        retryCountRef.current = 0;
        fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, error, isAccessDenied, retry };
}
