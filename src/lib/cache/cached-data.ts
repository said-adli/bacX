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
export const getCachedSubjects = unstable_cache(
    async (): Promise<CachedSubject[]> => {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("subjects")
            .select("id, name, icon, description, lesson_count")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("[CACHE] Failed to fetch subjects:", error.message);
            return [];
        }

        if (!data) return [];

        return data.map((s) => ({
            id: s.id,
            title: s.name,
            slug: s.id,
            image: s.icon || "",
            lessonCount: s.lesson_count || 0,
            description: s.description,
        }));
    },
    ["subjects-list"],
    {
        tags: [CACHE_TAGS.SUBJECTS],
        revalidate: 3600, // 1 hour fallback
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
