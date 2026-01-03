import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@/lib/auth-jwt';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis from Environment (Safe fallback to null if env missing during build)
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

// Global Rate Limiter: 50 requests per 10 seconds
const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(50, "10 s"),
        analytics: true,
    })
    : null;

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // --- SKIP STATIC ASSETS (FAST PATH) ---
    if (
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.startsWith('/favicon') ||
        path.includes('.')
    ) {
        return NextResponse.next();
    }

    // --- GLOBAL RATE LIMITING (EDGE) ---
    if (ratelimit) {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "127.0.0.1";
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
        if (!path.startsWith('/maintenance')) {
            return NextResponse.rewrite(new URL('/maintenance', request.url));
        }
        return NextResponse.next();
    } else if (path.startsWith('/maintenance')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // --- ROUTE CLASSIFICATION ---
    const adminRoutes = ['/admin'];
    const protectedRoutes = ['/dashboard', '/live', '/video', '/subscription', '/subject', '/profile', '/subjects', '/complete-profile', ...adminRoutes];

    const isProtected = protectedRoutes.some(p => path.startsWith(p));
    const isAdminRoute = adminRoutes.some(p => path.startsWith(p));

    // --- PUBLIC ROUTES: FAST PASS THROUGH ---
    if (!isProtected) {
        return NextResponse.next();
    }

    // --- PROTECTED ROUTES: CHECK SESSION ---
    const sessionCookie = request.cookies.get('bacx_session')?.value;

    if (!sessionCookie) {
        const loginUrl = new URL('/auth', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
    }

    // For admin routes, do full validation including checking claims
    // For regular protected routes, just verify the token is valid (faster)
    const claims = await verifySessionCookie(sessionCookie, isAdminRoute);

    if (!claims) {
        // Invalid or expired token - redirect to login
        const response = NextResponse.redirect(new URL('/auth', request.url));
        // Clear the invalid cookie
        response.cookies.delete('bacx_session');
        return response;
    }

    // --- ADMIN ROUTE: CHECK ROLE IN JWT ---
    if (isAdminRoute) {
        // Check JWT claims for admin role
        // NOTE: If role is updated in Firestore after login, user must re-login
        // This is the performance tradeoff - no DB call in middleware
        const isAdmin = claims.role === 'admin' || claims.admin === true;

        if (!isAdmin) {
            // Check the user's UID exists (they're authenticated but not admin)
            // Redirect to dashboard instead of home since they're logged in
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (they handle their own auth)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
    ],
};
