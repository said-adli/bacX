
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const GOOGLE_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

// Cache keys in global scope for Edge (cleared on cold start, but helps hot paths)
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

// Helper to verify Firebase Session Cookie (JWT) on Edge
async function verifySessionCookie(cookie: string) {
    if (!cookie) return null;

    const keys = await getGooglePublicKeys();
    if (!keys) return null; // Fail safe if we can't get keys

    try {
        // Create a function that selects the key based on the 'kid' in the header
        const JWKS = jose.createLocalJWKSet({
            keys: Object.entries(keys).map(([kid, pem]) => ({
                kid,
                ...jose.importX509(pem, 'RS256') // Logic to import if needed, but jose.createLocalJWKSet expects JSON Web Key Set format usually.
                // Actually, simpler approach for x509 certs with Jose and dynamic keys:
            }))
        } as any);

        // Better approach for Google's x509 endpoint with jose:
        // We need to find the correct key for the token's header.kid

        const { payload, protectedHeader } = await jose.jwtVerify(cookie, async (protectedHeader, token) => {
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
        return null; // Force redirect
    }
}

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis from Environment (Safe fallback to null if env missing during build)
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

// Global Rate Limiter: 50 requests per 10 seconds (Higher guardrails for global middleware)
const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(50, "10 s"),
        analytics: true,
    })
    : null;

export async function middleware(request: NextRequest) {
    // --- GLOBAL RATE LIMITING (EDGE) ---
    // Skip static files and internal Next.js paths
    if (ratelimit && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/static') && !request.nextUrl.pathname.startsWith('/favicon.ico')) {
        const ip = request.ip ?? '127.0.0.1';
        try {
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return new NextResponse('Too Many Requests', { status: 429 });
            }
        } catch (error) {
            console.error('Rate limit failed (fail-open):', error);
        }
    }

    // --- MAINTENANCE MODE CHECK ---
    const isMaintenance = process.env.MAINTENANCE_MODE === 'true';
    if (isMaintenance) {
        if (!request.nextUrl.pathname.startsWith('/maintenance') &&
            !request.nextUrl.pathname.startsWith('/_next') &&
            !request.nextUrl.pathname.startsWith('/static')) {
            return NextResponse.rewrite(new URL('/maintenance', request.url));
        }
    } else {
        if (request.nextUrl.pathname.startsWith('/maintenance')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // --- ROUTE PROTECTION ---
    const adminRoutes = ['/admin'];
    const protectedRoutes = ['/live', '/lessons', ...adminRoutes];

    const path = request.nextUrl.pathname;
    const isProtected = protectedRoutes.some(p => path.startsWith(p));
    const isAdminRoute = adminRoutes.some(p => path.startsWith(p));

    if (isProtected) {
        const sessionCookie = request.cookies.get('bacx_session')?.value;

        if (!sessionCookie) {
            const loginUrl = new URL('/auth', request.url);
            loginUrl.searchParams.set('redirect', path);
            return NextResponse.redirect(loginUrl);
        }

        const claims = await verifySessionCookie(sessionCookie);

        if (!claims) {
            // Invalid token
            return NextResponse.redirect(new URL('/auth', request.url));
        }

        // --- ADMIN CHECK ---
        if (isAdminRoute) {
            // Check for custom claim "admin" or role "admin"
            // NOTE: Standard Firebase custom claims are at root level of decoded object usually.
            if (claims.admin !== true && claims.role !== 'admin') {
                // unauthorized
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
