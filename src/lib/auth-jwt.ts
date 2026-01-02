import { type NextRequest } from 'next/server';
import * as jose from 'jose';

const GOOGLE_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

// Cache keys in global scope for Edge (cleared on cold start, but helps hot paths)
let cachedKeys: Record<string, string> | null = null;
let keysExpiry: number = 0;

export async function getGooglePublicKeys() {
    if (cachedKeys && Date.now() < keysExpiry) {
        return cachedKeys;
    }

    try {
        const response = await fetch(GOOGLE_KEYS_URL, { next: { revalidate: 3600 } });
        const cacheControl = response.headers.get('cache-control');
        const maxAgeMatch = cacheControl?.match(/max-age=(\d+)/);
        const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

        cachedKeys = await response.json();
        keysExpiry = Date.now() + (maxAge * 1000);
        return cachedKeys;
    } catch (error) {
        console.error('Failed to fetch Google public keys', error);
        return cachedKeys; // Return stale keys if available
    }
}

/**
 * FAST token verification that only checks signature validity
 * Does NOT check claims for non-admin routes (speed optimization)
 */
export async function verifySessionCookie(cookie: string, fullValidation: boolean = false) {
    if (!cookie) return null;

    const keys = await getGooglePublicKeys();
    if (!keys) return null;

    try {
        const options: jose.JWTVerifyOptions = {};

        // Only do full validation (issuer/audience) for admin routes
        if (fullValidation) {
            options.issuer = `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`;
            options.audience = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        }

        const { payload } = await jose.jwtVerify(cookie, async (protectedHeader) => {
            if (!protectedHeader.kid) throw new Error("No kid in header");
            const pem = keys[protectedHeader.kid];
            if (!pem) throw new Error("Key not found");
            return jose.importX509(pem, 'RS256');
        }, options);

        return payload;
    } catch (e) {
        // Only log for unexpected errors
        if (!(e instanceof jose.errors.JWTExpired)) {
            console.error("Token verification failed", e);
        }
        return null;
    }
}

export type SessionPayload = jose.JWTPayload;
