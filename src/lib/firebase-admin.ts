import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

    if (process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log("🔥 Firebase Admin initialized with Cert (Vercel/Production mode)");
    } else {
        // Fallback for local development if using GOOGLE_APPLICATION_CREDENTIALS
        // or properly warn if missing in production
        try {
            admin.initializeApp();
            console.log("🔥 Firebase Admin initialized with Default Credentials (Local/Dev mode)");
        } catch (e) {
            console.error("❌ Failed to initialize Firebase Admin:", e);
        }
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const messaging = admin.messaging();
// Re-export admin for cases where we need specific types or sub-modules
export { admin };
