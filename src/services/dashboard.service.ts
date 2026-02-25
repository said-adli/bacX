import { getCachedAnnouncements } from "@/lib/cache/cached-data";
import { getUserProgressMapRaw } from "@/lib/data/raw-db";

/**
 * Data Transfer Object for Dashboard Subjects.
 * Designed to be consumed directly by UI components (e.g., SubjectCard).
 */
// NEW: Import Strict DTO
import { SubjectDTO } from "@/types/subject";

export interface AnnouncementDTO {
    id: string;
    title: string | null;
    content: string;
    createdAt: Date;
    isNew: boolean;
}

export interface DashboardViewDTO {
    subjects: SubjectDTO[];
    announcements: AnnouncementDTO[];
}

/**
 * Service to orchestrate dashboard data fetching.
 * Uses CACHED subjects/announcements + FRESH user progress.
 */
/**
 * Service to orchestrate dashboard data fetching.
 */

export async function getDashboardSubjects(userId: string): Promise<SubjectDTO[]> {
    // ⚡ Cached: subjects keys
    // 🔒 Fresh: user progress
    // 🔑 Fresh: ownership
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    const [subjectsData, progressMap, ownershipReq] = await Promise.all([
        supabase.from('subjects')
            .select('id, name, icon, description, color, slug, lesson_count, lessons(id, title, required_plan_id, is_free)') // Explicit select
            .eq('is_active', true) // FILTER: Only active subjects
            .order('order_index', { ascending: true }),
        getUserProgressMapRaw(userId),
        supabase.from('user_content_ownership')
            .select('content_id')
            .eq('user_id', userId)
            // Ideally we filter by content_type='subject' but the table might be generic.
            // Assuming IDs are unique across tables or we just check existence.
            // If table has 'content_type', use it: .eq('content_type', 'subject')
            // My schema has content_type.
            .eq('content_type', 'subject')
    ]);

    const subjects = subjectsData.data || [];
    const ownedSubjectIds = new Set((ownershipReq.data || []).map(o => o.content_id));

    // Merge
    // Fix explicit any: Define the shape returned by the Supabase select above
    interface DashboardSubjectRaw {
        id: string;
        name: string;
        icon: string | null;
        description: string | null;
        color: string | null;
        slug: string | null;
        lesson_count: number;
        is_active: boolean;
        lessons: {
            id: string;
            title: string;
            required_plan_id: string | null;
            is_free: boolean;
        }[];
    }

    return (subjects as unknown as DashboardSubjectRaw[]).map((subject) => {
        const progress = progressMap.get(subject.id) ?? 0;
        return {
            id: subject.id,
            name: subject.name,
            icon: subject.icon,
            description: subject.description,
            color: subject.color,
            slug: subject.slug || subject.id,
            lessonCount: subject.lesson_count,
            lessons: subject.lessons || [],
            progress: progress,
            isOwned: ownedSubjectIds.has(subject.id),
            is_active: subject.is_active
        };
    });
}

export async function getDashboardAnnouncements(): Promise<AnnouncementDTO[]> {
    // ⚡ Cached: announcements
    const announcementsData = await getCachedAnnouncements(5);

    return announcementsData.map((a) => ({
        id: a.id,
        title: a.title || "تحديث جديد",
        content: a.content,
        createdAt: new Date(a.createdAt),
        isNew: (new Date().getTime() - new Date(a.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000)
    }));
}

// Deprecated: kept only if something else broke, but we are removing its main usage.
// We can remove it to enforce the new pattern.
// export async function getDashboardView... REMOVED

export interface ScheduleDTO {
    id: string;
    title: string;
    description: string | null;
    event_date: Date;
    type: string;
}

export async function getDashboardSchedules(): Promise<ScheduleDTO[]> {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5);

    if (error) {
        console.error("Error fetching schedules:", error);
        return [];
    }

    return (data || []).map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        event_date: new Date(s.event_date),
        type: s.type
    }));
}
