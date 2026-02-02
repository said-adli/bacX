/**
 * Gold Standard Caching Layer for BacX LMS
 * 
 * Uses Next.js unstable_cache with a STATELESS Supabase admin client.
 * This avoids "Dynamic server usage: cookies()" errors.
 * 
 * IMPORTANT: Only cache PUBLIC data here. User-specific data should
 * be fetched fresh using the cookie-based client.
 */

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

// ============================================================================
// CACHE TAGS - Used for selective revalidation
// ============================================================================

export const CACHE_TAGS = {
    SUBJECTS: "subjects",
    LESSONS: "lessons",
    CURRICULUM: "curriculum",
    ANNOUNCEMENTS: "announcements",
    SITE_CONFIG: "site-config",
    // New tags for RPC pattern
    PLANS: "plans",
    USERS: "users",
    PLATFORM_UPDATES: "platform-updates",
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface CachedSubject {
    id: string;
    title: string;
    slug: string;
    image: string;
    lessonCount: number;
    description: string | null;
}

export interface CachedLesson {
    id: string;
    title: string;
    order: number;
    videoUrl: string | null;
    duration: number | null;
    isFree: boolean;
}

export interface CachedAnnouncement {
    id: string;
    title: string | null;
    content: string;
    createdAt: string;
    isActive: boolean;
}

// ============================================================================
// CACHED FUNCTIONS
// ============================================================================

/**
 * Get all subjects - CACHED for 1 hour, revalidated on admin mutation.
 * Uses admin client (stateless, no cookies).
 */
// NEW: Import Strict DTO
import { SubjectDTO } from "@/types/subject";

// ... (imports)

// remove local CachedSubject interface if generic, or keep for internal use but mapped to DTO
// For simplicity, we will use SubjectDTO as the return type.

/**
 * Get all subjects - CACHED for 1 hour, revalidated on admin mutation.
 * Uses admin client (stateless, no cookies).
 */
export const getCachedSubjects = unstable_cache(
    async (): Promise<SubjectDTO[]> => {
        try {
            // DEBUG: Verify env vars are present
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
            console.log("[CACHE] Env check - URL:", url ? "SET" : "MISSING", "| Service Key:", hasServiceKey ? "SET" : "MISSING");

            const supabase = createAdminClient();

            console.log("[CACHE] Starting subjects query...");
            const startTime = Date.now();

            const { data, error } = await supabase
                .from("subjects")
                .select("id, name, slug, is_active, icon, description, lessons(id, title)")
                .eq("is_active", true)
                .order("created_at", { ascending: true });

            const elapsed = Date.now() - startTime;
            console.log(`[CACHE] Query completed in ${elapsed}ms`);

            if (error) {
                // Log FULL error object for 406/connection issues
                console.error("[CACHE] Supabase Error:", JSON.stringify({
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                }, null, 2));
                return [];
            }

            console.log("[CACHE] getCachedSubjects returned:", data?.length || 0, "subjects");
            if (data && data.length > 0) {
                console.log("[CACHE] First subject:", data[0].name);
            }

            if (!data) return [];

            return data.map((s) => ({
                id: s.id,
                name: s.name,
                icon: s.icon || null,
                description: s.description,
                color: null,
                slug: s.slug || s.id,
                lessonCount: s.lessons?.length || 0,
                lessons: Array.isArray(s.lessons)
                    ? s.lessons.map((l: any) => ({ id: l.id, title: l.title }))
                    : [],
                progress: 0
            }));
        } catch (err: any) {
            // Catch network/timeout errors
            console.error("[CACHE] CRITICAL ERROR in getCachedSubjects:", {
                name: err?.name,
                message: err?.message,
                cause: err?.cause,
                stack: err?.stack?.substring(0, 500)
            });
            return [];
        }
    },
    ["subjects-list"],
    {
        tags: [CACHE_TAGS.SUBJECTS],
        revalidate: 3600,
    }
);

/**
 * Get lessons for a specific subject - CACHED per subject.
 * Tagged for selective revalidation.
 */
export async function getCachedLessonsForSubject(subjectId: string): Promise<CachedLesson[]> {
    return unstable_cache(
        async () => {
            const supabase = createAdminClient();

            const { data, error } = await supabase
                .from("lessons")
                .select("id, title, order, video_url, duration, is_free")
                .eq("subject_id", subjectId)
                .order("order", { ascending: true });

            if (error) {
                console.error(`[CACHE] Failed to fetch lessons for ${subjectId}:`, error.message);
                return [];
            }

            if (!data) return [];

            return data.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                order: lesson.order,
                videoUrl: lesson.video_url,
                duration: lesson.duration,
                isFree: lesson.is_free ?? false,
            }));
        },
        [`lessons-${subjectId}`],
        {
            tags: [CACHE_TAGS.LESSONS, `lessons:${subjectId}`],
            revalidate: 3600,
        }
    )();
}

/**
 * Get active announcements - CACHED, refreshed on admin mutation.
 */
export const getCachedAnnouncements = unstable_cache(
    async (limit: number = 5): Promise<CachedAnnouncement[]> => {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("announcements")
            .select("id, title, content, created_at, is_active")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("[CACHE] Failed to fetch announcements:", error.message);
            return [];
        }

        if (!data) return [];

        return data.map((a) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            createdAt: a.created_at,
            isActive: a.is_active,
        }));
    },
    ["announcements-active"],
    {
        tags: [CACHE_TAGS.ANNOUNCEMENTS],
        revalidate: 1800, // 30 minutes fallback
    }
);

/**
 * Get full curriculum structure (subjects with nested lessons).
 * Useful for navigation components.
 */
export const getCachedCurriculum = unstable_cache(
    async () => {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("subjects")
            .select(`
                id,
                name,
                icon,
                lesson_count,
                lessons (
                    id,
                    title,
                    order,
                    is_free
                )
            `)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("[CACHE] Failed to fetch curriculum:", error.message);
            return [];
        }

        if (!data) return [];

        return data.map((subject) => ({
            id: subject.id,
            name: subject.name,
            icon: subject.icon,
            lessonCount: subject.lesson_count || 0,
            lessons: (subject.lessons || [])
                .sort((a: any, b: any) => a.order - b.order)
                .map((lesson: any) => ({
                    id: lesson.id,
                    title: lesson.title,
                    order: lesson.order,
                    isFree: lesson.is_free ?? false,
                })),
        }));
    },
    ["curriculum-full"],
    {
        tags: [CACHE_TAGS.CURRICULUM, CACHE_TAGS.SUBJECTS, CACHE_TAGS.LESSONS],
        revalidate: 3600,
    }
);
