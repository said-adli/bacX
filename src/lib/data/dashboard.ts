import { db } from "@/lib/firebase-admin";
import { UserProfile } from "@/context/AuthContext";

export interface DashboardData {
    announcement: {
        content: string;
        createdAt: Date;
    } | null;
    userProfile: UserProfile | null;
}

/**
 * Fetches initial data for the dashboard on the server.
 * Parallelizes independent fetches for performance.
 */
export async function getDashboardData(uid: string): Promise<DashboardData> {
    const [announcementSnap, userSnap] = await Promise.all([
        db.collection("announcements")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get(),
        db.collection("users").doc(uid).get(),
    ]);

    let announcement = null;
    if (!announcementSnap.empty) {
        const doc = announcementSnap.docs[0];
        const data = doc.data();
        announcement = {
            content: data.content,
            createdAt: data.createdAt.toDate(),
        };
    }

    let userProfile: UserProfile | null = null;
    if (userSnap.exists) {
        // Cast the data to UserProfile. 
        // Note: Firestore Admin SDK returns standard JS objects, which matches the interface roughly.
        // We might need to handle Timestamp conversion if we strictly used Date in UserProfile, 
        // but UserProfile uses 'unknown' for dates in the definition I saw earlier:
        // createdAt?: unknown; lastLogin?: unknown; -> This is safe.
        userProfile = userSnap.data() as UserProfile;
    }

    return {
        announcement,
        userProfile,
    };
}
