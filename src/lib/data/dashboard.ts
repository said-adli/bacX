import { db } from "@/lib/firebase-admin";

export interface DashboardData {
    announcement: {
        content: string;
        createdAt: Date;
    } | null;
    userProfile: {
        displayName?: string;
        firstName?: string; // Derived from display/full name
    } | null;
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

    let userProfile = null;
    if (userSnap.exists) {
        const data = userSnap.data();
        const fullName = data?.fullName || data?.displayName || "Student";
        userProfile = {
            displayName: fullName,
            firstName: fullName.split(" ")[0],
        };
    }

    return {
        announcement,
        userProfile,
    };
}
