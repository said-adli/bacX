import { getAllSubjectsRaw, getUserProgressMapRaw } from "@/lib/data/raw-db";
import { createClient } from "@/utils/supabase/server";

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
 * Merges raw database data with user progress safely.
 */
export async function getDashboardView(userId: string): Promise<DashboardViewDTO> {
    const supabase = await createClient();

    // Step A: Fetch data in parallel
    const [subjectsRes, progressMap, announcementsRes] = await Promise.all([
        getAllSubjectsRaw(),
        getUserProgressMapRaw(userId),
        supabase
            .from("announcements")
            .select("id, title, content, created_at")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(5)
    ]);

    const subjects = subjectsRes; // Already raw data
    const announcementsData = announcementsRes.data || [];

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
    const announcements: AnnouncementDTO[] = announcementsData.map((a: any) => ({
        id: a.id,
        title: a.title || "تحديث جديد", // Fallback if title missing
        content: a.content,
        createdAt: new Date(a.created_at),
        isNew: (new Date().getTime() - new Date(a.created_at).getTime()) < (7 * 24 * 60 * 60 * 1000) // New if < 7 days
    }));

    return { subjects: dashboardSubjects, announcements };
}
