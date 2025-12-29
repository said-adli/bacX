import 'server-only';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const GOOGLE_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

// Cache keys (Server-side cache)
let cachedKeys: Record<string, string> | null = null;
let keysExpiry: number = 0;

async function getGooglePublicKeys() {
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
        return null;
    }
}

export async function verifySession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('bacx_session')?.value;

    if (!sessionCookie) return null;

    const keys = await getGooglePublicKeys();
    if (!keys) return null;

    try {
        const { payload } = await jose.jwtVerify(sessionCookie, async (protectedHeader) => {
            if (!protectedHeader.kid) throw new Error("No kid in header");
            const pem = keys[protectedHeader.kid];
            if (!pem) throw new Error("Key not found");
            return jose.importX509(pem, 'RS256');
        }, {
            issuer: `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
            audience: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });

        return payload;
    } catch (e) {
        console.error("Token verification failed", e);
        return null;
    }
}

export async function requireAdmin() {
    const claims = await verifySession();
    if (!claims || (claims.admin !== true && claims.role !== 'admin')) {
        throw new Error("Unauthorized: Admin access required");
    }
    return claims;
}

export async function requireAuth() {
    const claims = await verifySession();
    if (!claims) {
        throw new Error("Unauthorized: Login required");
    }
    return claims;
}
