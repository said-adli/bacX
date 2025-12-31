import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db } from './firebase';

/**
 * Push Notification helpers for Brainy Mobile
 * Handles token registration and notification setup
 */

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permission for push notifications not granted');
        return false;
    }

    // Android-specific channel setup
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('live', {
            name: 'البث المباشر',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563EB',
            sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('announcements', {
            name: 'الإعلانات',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
        });
    }

    return true;
}

/**
 * Get the Expo push token
 */
export async function getExpoPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
        return null;
    }

    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;

        const token = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
        });

        return token.data;
    } catch (error) {
        console.error('Failed to get push token:', error);
        return null;
    }
}

/**
 * Save push token to Firestore for the authenticated user
 */
export async function savePushTokenToFirestore(
    userId: string,
    token: string
): Promise<void> {
    try {
        await db.collection('users').doc(userId).update({
            pushToken: token,
            pushTokenUpdatedAt: new Date(),
            devicePlatform: Platform.OS,
        });
        console.log('✅ Push token saved to Firestore');
    } catch (error) {
        console.error('Failed to save push token:', error);
    }
}

/**
 * Remove push token on logout
 */
export async function removePushTokenFromFirestore(userId: string): Promise<void> {
    try {
        await db.collection('users').doc(userId).update({
            pushToken: null,
            pushTokenUpdatedAt: new Date(),
        });
        console.log('🗑️ Push token removed from Firestore');
    } catch (error) {
        console.error('Failed to remove push token:', error);
    }
}

/**
 * Register for push notifications and save token
 * Call this after user logs in
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
    const hasPermission = await requestNotificationPermissions();

    if (!hasPermission) {
        return null;
    }

    const token = await getExpoPushToken();

    if (token) {
        await savePushTokenToFirestore(userId, token);
    }

    return token;
}

/**
 * Listen for notification interactions
 */
export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
) {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Listen for incoming notifications when app is in foreground
 */
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
) {
    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: 'default',
        },
        trigger: null, // Immediate
    });
}
