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
import { SubjectDTO } from "@/types/subject";

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
    async (): Promise<SubjectDTO[]> => {
        try {
            const supabase = createAdminClient();

            const { data, error } = await supabase
                .from("subjects")
                .select("id, name, slug, is_active, icon, description, lessons(id, title)")
                .eq("is_active", true)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("[CACHE] Supabase Error:", error);
                return [];
            }

            if (!data) return [];

            interface RawLesson { id: string; title: string }
            return data.map((s) => ({
                id: s.id,
                name: s.name,
                icon: s.icon || null,
                description: s.description,
                color: null,
                slug: s.slug || s.id,
                is_active: s.is_active,
                lessonCount: s.lessons?.length || 0,
                lessons: Array.isArray(s.lessons)
                    ? (s.lessons as RawLesson[]).map((l) => ({ id: l.id, title: l.title }))
                    : [],
                progress: 0
            }));
        } catch (err: unknown) {
            console.error("[CACHE] CRITICAL ERROR in getCachedSubjects:", err);
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
                .select("id, title, order_index, video_url, duration, is_free")
                .eq("unit_id", subjectId)
                .order("order_index", { ascending: true });

            if (error) {
                console.error(`[CACHE] Failed to fetch lessons for ${subjectId}:`, error.message);
                return [];
            }

            if (!data) return [];

            return data.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                order: lesson.order_index,
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
        try {
            const supabase = createAdminClient();

            const { data, error } = await supabase
                .from("announcements")
                .select("id, content, created_at, is_active")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(limit);

            if (error) {
                console.error("[CACHE] Failed to fetch announcements:", error);
                return [];
            }

            if (!data) return [];

            return data.map((a) => ({
                id: a.id,
                title: null,
                content: a.content,
                createdAt: a.created_at,
                isActive: a.is_active,
            }));
        } catch (err: unknown) {
            console.error("[CACHE] CRITICAL ERROR in getCachedAnnouncements:", err);
            return [];
        }
    },
    ["announcements-active"],
    {
        tags: [CACHE_TAGS.ANNOUNCEMENTS],
        revalidate: 1800,
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
                is_active,
                lessons (
                    id,
                    title,
                    order_index,
                    is_free
                )
            `)
            .eq("is_active", true)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("[CACHE] Failed to fetch curriculum:", error.message);
            return [];
        }

        if (!data) return [];

        interface RawLessonCurr { id: string; title: string; order_index: number; is_free: boolean }
        return data.map((subject) => ({
            id: subject.id,
            name: subject.name,
            icon: subject.icon,
            lessonCount: ((subject.lessons || []) as RawLessonCurr[]).length,
            lessons: ((subject.lessons || []) as RawLessonCurr[])
                .sort((a, b) => a.order_index - b.order_index)
                .map((lesson) => ({
                    id: lesson.id,
                    title: lesson.title,
                    order: lesson.order_index,
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
