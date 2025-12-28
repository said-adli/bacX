import { NextResponse } from 'next/server';
import { admin, db } from '@/lib/firebase-admin'; // Use centralized init

export async function GET() {
    const timestamp = new Date().toISOString();
    let firestoreConnected = false;
    let firestoreLatency = 0;

    try {
        const start = Date.now();
        // db is already imported from lib/firebase-admin

        // Simple read to verify connectivity
        await db.collection('config').doc('health_check').get();

        firestoreLatency = Date.now() - start;
        firestoreConnected = true;
    } catch (error) {
        console.error('Health check - Firestore error:', error);
        firestoreConnected = false;
    }

    const response = {
        status: firestoreConnected ? 'ok' : 'degraded',
        timestamp,
        version: process.env.npm_package_version || '0.1.0',
        checks: {
            firestore: {
                connected: firestoreConnected,
                latencyMs: firestoreLatency
            },
            environment: {
                nodeEnv: process.env.NODE_ENV,
                hasVideoSalt: !!process.env.VIDEO_ENCRYPTION_SALT,
                hasRecaptchaKey: !!process.env.NEXT_PUBLIC_RECAPTCHA_KEY,
                hasFirebaseConfig: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
            }
        }
    };

    return NextResponse.json(response, {
        status: firestoreConnected ? 200 : 503,
        headers: {
            'Cache-Control': 'no-store, max-age=0'
        }
    });
}
