import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Push Live Notification Cloud Function
 * 
 * Triggers when admin starts a live stream (config/live_stream.isLive changes to true)
 * Sends push notifications to all users with registered Expo push tokens
 * 
 * SETUP:
 * 1. Install dependencies: npm install firebase-functions firebase-admin node-fetch@2
 * 2. Deploy: firebase deploy --only functions:pushLiveNotification
 */

interface LiveStreamConfig {
    isLive: boolean;
    title?: string;
    subject?: string;
    updatedAt?: admin.firestore.Timestamp;
}

interface UserDoc {
    pushToken?: string;
    displayName?: string;
}

interface ExpoPushMessage {
    to: string;
    sound: 'default';
    title: string;
    body: string;
    data: {
        type: string;
        screen: string;
    };
    channelId: string;
}

export const pushLiveNotification = functions.firestore
    .document('config/live_stream')
    .onUpdate(async (change) => {
        const before = change.before.data() as LiveStreamConfig;
        const after = change.after.data() as LiveStreamConfig;

        // Only trigger when stream goes live (false -> true)
        if (before.isLive === false && after.isLive === true) {
            console.log('🔴 Live stream started! Sending push notifications...');

            try {
                // Fetch all users with push tokens
                const usersSnapshot = await db
                    .collection('users')
                    .where('pushToken', '!=', null)
                    .get();

                if (usersSnapshot.empty) {
                    console.log('No users with push tokens found');
                    return null;
                }

                // Collect all push tokens
                const pushTokens: string[] = [];
                usersSnapshot.forEach((doc) => {
                    const userData = doc.data() as UserDoc;
                    if (userData.pushToken) {
                        pushTokens.push(userData.pushToken);
                    }
                });

                console.log(`Found ${pushTokens.length} users with push tokens`);

                // Prepare the notification message
                const title = '🔴 بث مباشر الآن!';
                const body = after.title || 'انضم إلى البث المباشر الآن';

                // Send notifications in batches (Expo limit is 100 per request)
                const batchSize = 100;
                const batches: ExpoPushMessage[][] = [];

                for (let i = 0; i < pushTokens.length; i += batchSize) {
                    const batch = pushTokens.slice(i, i + batchSize).map((token) => ({
                        to: token,
                        sound: 'default' as const,
                        title,
                        body,
                        data: {
                            type: 'live',
                            screen: '/(app)/live',
                        },
                        channelId: 'live', // Android notification channel
                    }));
                    batches.push(batch);
                }

                // Send to Expo Push API
                const fetch = (await import('node-fetch')).default;

                for (const batch of batches) {
                    const response = await fetch('https://exp.host/--/api/v2/push/send', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Accept-Encoding': 'gzip, deflate',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(batch),
                    });

                    const result = await response.json();
                    console.log('Expo Push Response:', result);
                }

                console.log(`✅ Successfully sent ${pushTokens.length} notifications`);
                return null;
            } catch (error) {
                console.error('Error sending push notifications:', error);
                throw error;
            }
        }

        // Stream ended or other update - no notification needed
        return null;
    });

/**
 * Clean up invalid push tokens
 * 
 * Run periodically to remove invalid/expired tokens
 * Can be triggered via Cloud Scheduler
 */
export const cleanupInvalidTokens = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async () => {
        console.log('🧹 Cleaning up invalid push tokens...');

        try {
            const usersSnapshot = await db
                .collection('users')
                .where('pushToken', '!=', null)
                .get();

            const batch = db.batch();
            let cleanedCount = 0;

            usersSnapshot.forEach((doc) => {
                const token = doc.data().pushToken;
                // Check if token is in valid Expo format
                if (token && !token.startsWith('ExponentPushToken[')) {
                    batch.update(doc.ref, { pushToken: null });
                    cleanedCount++;
                }
            });

            if (cleanedCount > 0) {
                await batch.commit();
                console.log(`✅ Cleaned ${cleanedCount} invalid tokens`);
            } else {
                console.log('No invalid tokens found');
            }

            return null;
        } catch (error) {
            console.error('Error cleaning tokens:', error);
            throw error;
        }
    });
