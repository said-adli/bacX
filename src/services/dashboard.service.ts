import { getAllSubjectsRaw, getUserProgressMapRaw } from "@/lib/data/raw-db";

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

/**
 * Service to orchestrate dashboard data fetching.
 * Merges raw database data with user progress safely.
 */
export async function getDashboardView(userId: string): Promise<DashboardSubjectDTO[]> {
    // Step A: Fetch data in parallel
    const [subjects, progressMap] = await Promise.all([
        getAllSubjectsRaw(),
        getUserProgressMapRaw(userId)
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

    return dashboardSubjects;
}
