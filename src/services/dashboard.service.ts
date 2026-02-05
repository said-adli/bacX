import { getCachedSubjects, getCachedAnnouncements } from "@/lib/cache/cached-data";
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
    const [subjects, progressMap] = await Promise.all([
        getCachedSubjects(),
        getUserProgressMapRaw(userId),
    ]);

    // Merge
    return subjects.map((subject) => {
        const progress = progressMap.get(subject.id) ?? 0;
        return {
            ...subject,
            progress: progress,
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

