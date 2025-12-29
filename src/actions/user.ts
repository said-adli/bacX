'use server';

import { db, auth } from "@/lib/firebase-admin";

export async function deleteUserData(userId: string) {
    if (!userId) throw new Error("User ID required");

    try {
        const batch = db.batch();

        // 1. Delete User Doc
        batch.delete(db.collection('users').doc(userId));

        // 2. Delete Payments
        const paymentsSnap = await db.collection('payments')
            .where('userId', '==', userId)
            .get();
        paymentsSnap.docs.forEach(doc => batch.delete(doc.ref));

        // 3. Delete Hand Raises
        const raisesSnap = await db.collection('hand_raises')
            .where('userId', '==', userId)
            .get();
        raisesSnap.docs.forEach(doc => batch.delete(doc.ref));

        await batch.commit();

        // 4. Revoke Claims / Delete Auth (Optional)
        // Usually we might want to actually delete the Auth user too?
        // The previous Cloud Function just set claims to {}.
        try {
            await auth.setCustomUserClaims(userId, {});
        } catch (e) {
            console.error("Failed to revoke claims", e);
        }

        // NOTE: Cloudinary files are NOT deleted here as we lack Admin API keys.

        return { success: true, message: 'User data deleted.' };

    } catch (error: any) {
        console.error("Delete user data error:", error);
        throw new Error('Failed to delete user data.');
    }
}
