import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock_key_for_build",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock_project.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock_project_id",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock_bucket",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000:web:0000000000"
};

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn("⚠️  WARNING: Firebase Environment Variables are missing. Using mock config for build.");
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize App Check
if (typeof window !== "undefined") {
    import("firebase/app-check").then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) => {
        // You must manually create valid Recapcha Key in Firebase Console -> App Check
        // Using a placeholder dev key here if env var missing
        // Initialize App Check with ReCaptcha Enterprise
        // Ensure you have enabled the "ReCAPTCHA Enterprise" API in Google Cloud Console
        // and created a key in Firebase Console -> App Check
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

        if (siteKey) {
            initializeAppCheck(app, {
                provider: new ReCaptchaEnterpriseProvider(siteKey),
                isTokenAutoRefreshEnabled: true
            });
            // console.log("🛡️ App Check Initialized with Enterprise Provider");
        } else {
            // console.warn("⚠️ App Check skipped: NEXT_PUBLIC_RECAPTCHA_KEY missing");
        }
        // console.log("🛡️ App Check Initialized");
    }).catch(err => console.error("App Check Init Failed", err));
}
