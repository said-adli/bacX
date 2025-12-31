import { collection, getCountFromServer, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Platform Statistics Service
 * 
 * Fetches REAL counts from Firestore - no fake fallbacks.
 * All statistics shown to users must be 100% accurate.
 */

export interface PlatformStats {
    totalStudents: number;
    totalLessons: number;
    isLive: boolean;
    liveTitle?: string;
}

export interface SubjectStats {
    id: string;
    name: string;
    lessonsCount: number;
}

/**
 * Get platform-wide statistics (server-side)
 * Used in landing page and global stats
 */
export async function getPlatformStats(): Promise<PlatformStats> {
    try {
        // Count students only (not admins)
        const studentsQuery = query(
            collection(db, "users"),
            where("role", "==", "student")
        );

        const lessonsRef = collection(db, "lessons");
        const liveRef = doc(db, "config", "live_stream");

        const [studentsSnapshot, lessonsSnapshot, liveDoc] = await Promise.all([
            getCountFromServer(studentsQuery),
            getCountFromServer(lessonsRef),
            getDoc(liveRef)
        ]);

        const liveData = liveDoc.data();

        return {
            totalStudents: studentsSnapshot.data().count,
            totalLessons: lessonsSnapshot.data().count,
            isLive: liveData?.isLive || false,
            liveTitle: liveData?.title
        };
    } catch (error) {
        console.error("Stats fetch error:", error);
        // Return zeros - NEVER fake data
        return {
            totalStudents: 0,
            totalLessons: 0,
            isLive: false
        };
    }
}

/**
 * Get lesson counts per subject
 * Returns actual counts from Firestore
 */
export async function getSubjectLessonCounts(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();

    try {
        // List of subjects to count
        const subjects = ['math', 'physics', 'science', 'arabic', 'languages', 'philosophy'];

        await Promise.all(
            subjects.map(async (subjectId) => {
                const subjectQuery = query(
                    collection(db, "lessons"),
                    where("subject", "==", subjectId)
                );
                const snapshot = await getCountFromServer(subjectQuery);
                counts.set(subjectId, snapshot.data().count);
            })
        );
    } catch (error) {
        console.error("Subject counts error:", error);
        // Return empty map - no fake counts
    }

    return counts;
}

/**
 * Get user's completed lessons count for a subject
 * Tracks actual user progress
 */
export async function getUserProgress(userId: string, subjectId: string): Promise<number> {
    try {
        const progressRef = doc(db, "users", userId, "progress", subjectId);
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
            const data = progressDoc.data();
            return data?.completedLessons?.length || 0;
        }
        return 0;
    } catch (error) {
        console.error("Progress fetch error:", error);
        return 0;
    }
}

/**
 * Format count for display with zero-state handling
 * Shows honest messaging when no data exists
 */
export function formatStatDisplay(count: number, type: 'students' | 'lessons'): string {
    if (count === 0) {
        return type === 'students' ? 'انضم أولاً!' : 'قريباً...';
    }
    if (count < 10) {
        return count.toString();
    }
    return `${count.toLocaleString('ar-SA')}+`;
}
