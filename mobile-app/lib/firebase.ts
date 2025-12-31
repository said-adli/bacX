import { initializeApp, getApps, getApp, FirebaseApp } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/**
 * Firebase Configuration for Brainy Mobile
 * Uses the same Firebase project as the web app
 * 
 * Note: For React Native Firebase, configuration is typically
 * loaded from google-services.json (Android) and GoogleService-Info.plist (iOS)
 * which are placed in the project root and referenced in app.json
 */

// Firebase is auto-initialized from native config files
// This file provides typed exports for use throughout the app

let firebaseApp: FirebaseApp;

try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
        // Firebase will auto-initialize from native config files
        // This is a fallback for development/testing
        console.log('📱 Firebase: Initializing from native config...');
        firebaseApp = initializeApp({
            // These are loaded from google-services.json / GoogleService-Info.plist
            // Placeholder for type safety, actual values come from native config
        } as never);
    } else {
        firebaseApp = getApp();
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    firebaseApp = getApp();
}

// Auth instance
export const firebaseAuth = auth();

// Firestore instance
export const db = firestore();

// Export types for use in components
export type { FirebaseAuthTypes, FirebaseFirestoreTypes };

// Helper function to get current user
export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
    return firebaseAuth.currentUser;
};

// Helper function to sign out
export const signOut = async (): Promise<void> => {
    await firebaseAuth.signOut();
};

// Firestore collection references matching web structure
export const collections = {
    users: () => db.collection('users'),
    lessons: () => db.collection('lessons'),
    subjects: () => db.collection('subjects'),
    config: () => db.collection('config'),
    secretStream: () => db.collection('secret_stream'),
    announcements: () => db.collection('announcements'),
    payments: () => db.collection('payments'),
} as const;

// Document references
export const docs = {
    user: (uid: string) => db.collection('users').doc(uid),
    liveStream: () => db.collection('config').doc('live_stream'),
    secretStreamCurrent: () => db.collection('secret_stream').doc('current'),
} as const;

export { firebaseApp };
