import { createClient } from "@/utils/supabase/server";

export interface DashboardSubject {
    id: string;
    title: string;
    slug: string;
    image: string;
}

/**
 * Direct Data Access Layer
 * Fetches raw data from the database without any caching wrappers.
 */

// We need to define the shape of valid subjects from the DB based on content_schema.sql
// id: string (primary key)
// name: string
// icon: string
// description: string
// lesson_count: number
// created_at: string

export async function getAllSubjectsRaw(): Promise<DashboardSubject[]> {
    const supabase = await createClient();

    // Fetch all subjects, ordered by creation time
    // equivalent to: SELECT * FROM subjects ORDER BY created_at ASC
    const { data, error } = await supabase
        .from('subjects')
        .select('id, name, icon')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Raw DB Error [getAllSubjectsRaw]:", error);
        throw new Error(`Failed to fetch subjects: ${error.message}`);
    }

    if (!data) return [];

    // Map DB fields to UI fields
    return data.map((subject) => ({
        id: subject.id,
        title: subject.name, // Map 'name' to 'title'
        slug: subject.id,    // 'id' is used as 'slug' (e.g. 'math', 'physics')
        image: subject.icon, // Map 'icon' to 'image'
    }));
}

/**
 * Fetches user progress for ALL subjects in one query.
 * Returns a Map where Key is subjectId and Value is percentage (0-100).
 * This Map allows O(1) instant lookup.
 */
export async function getUserProgressMapRaw(userId: string): Promise<Map<string, number>> {
    const supabase = await createClient();

    // 1. Fetch total lesson counts for all subjects
    const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, lesson_count');

    if (subjectsError) {
        console.error("Raw DB Error [getUserProgressMapRaw - subjects]:", subjectsError);
        throw new Error(`Failed to fetch subject counts: ${subjectsError.message}`);
    }

    // 2. Fetch completed lessons for the user, joined with lessons table to get subject_id
    // We only care about completed lessons
    const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select(`
            lesson_id,
            is_completed,
            lessons!inner (
                subject_id
            )
        `)
        .eq('user_id', userId)
        .eq('is_completed', true);

    if (progressError) {
        console.error("Raw DB Error [getUserProgressMapRaw - progress]:", progressError);
        throw new Error(`Failed to fetch user progress: ${progressError.message}`);
    }

    // 3. Aggregate completed count per subject
    const completedCounts: Record<string, number> = {};

    interface ProgressItem {
        lesson_id: string;
        is_completed: boolean;
        lessons: { // joined
            subject_id: string;
        } | null;
    }

    (progressData as unknown as ProgressItem[])?.forEach((item) => {
        const subjectId = item.lessons?.subject_id;
        if (subjectId) {
            completedCounts[subjectId] = (completedCounts[subjectId] || 0) + 1;
        }
    });

    // 4. Calculate percentage for each subject
    const progressMap = new Map<string, number>();

    subjects?.forEach((subject) => {
        const total = subject.lesson_count || 0;
        const completed = completedCounts[subject.id] || 0;

        let percentage = 0;
        if (total > 0) {
            percentage = Math.round((completed / total) * 100);
        }

        // Clamp between 0 and 100 just in case
        percentage = Math.max(0, Math.min(100, percentage));

        progressMap.set(subject.id, percentage);
    });

    return progressMap;
}
