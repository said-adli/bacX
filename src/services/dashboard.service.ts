import { getCachedSubjects, getCachedAnnouncements } from "@/lib/cache/cached-data";
import { getUserProgressMapRaw } from "@/lib/data/raw-db";

/**
 * Data Transfer Object for Dashboard Subjects.
 * Designed to be consumed directly by UI components (e.g., SubjectCard).
 */
export interface DashboardSubjectDTO {
    id: string;
    title: string; // User requested 'title'
    name: string;  // SubjectCard expects 'name'
    image: string;
    progress: number;
    isCompleted: boolean;
    href: string;
}

export interface AnnouncementDTO {
    id: string;
    title: string | null;
    content: string;
    createdAt: Date;
    isNew: boolean;
}

export interface DashboardViewDTO {
    subjects: DashboardSubjectDTO[];
    announcements: AnnouncementDTO[];
}

/**
 * Service to orchestrate dashboard data fetching.
 * Uses CACHED subjects/announcements + FRESH user progress.
 */
export async function getDashboardView(userId: string): Promise<DashboardViewDTO> {
    // Step A: Fetch data in parallel
    // ⚡ Cached: subjects, announcements (stateless, instant)
    // 🔒 Fresh: user progress (user-specific, requires auth)
    const [subjects, progressMap, announcementsData] = await Promise.all([
        getCachedSubjects(),           // ⚡ From Next.js cache
        getUserProgressMapRaw(userId), // 🔒 Fresh query per user
        getCachedAnnouncements(5),     // ⚡ From Next.js cache
    ]);

    // Step B & C: Merge and Transform
    const dashboardSubjects: DashboardSubjectDTO[] = subjects.map((subject) => {
        // Safe lookup for progress (O(1))
        const progress = progressMap.get(subject.id) ?? 0;

        return {
            id: subject.id,
            title: subject.title,
            name: subject.title, // Alias title to name for Component compatibility
            image: subject.image,
            progress: progress,
            isCompleted: progress === 100,
            // Step D: Construct Link
            href: `/materials/${subject.slug}`,
        };
    });

    // Step E: Transform Announcements
    const announcements: AnnouncementDTO[] = announcementsData.map((a) => ({
        id: a.id,
        title: a.title || "تحديث جديد", // Fallback if title missing
        content: a.content,
        createdAt: new Date(a.createdAt),
        isNew: (new Date().getTime() - new Date(a.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000) // New if < 7 days
    }));

    return { subjects: dashboardSubjects, announcements };
}

