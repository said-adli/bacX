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
    // Optimization: Only rate limit sensitive AUTH routes to save Redis Quota
    const isAuthApi = path.startsWith('/api/auth');

    if (ratelimit && isAuthApi) {
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

    // --- ROUTE CLASSIFICATION (FAIL-CLOSED) ---
    // Define PUBLIC routes (whitelist). All other routes are PROTECTED by default.
    const publicRoutes = [
        '/',
        // '/auth',
        '/auth/login',
        '/auth/signup',
        '/about',
        '/pricing',
        '/support',
        '/privacy',
        '/terms',
        '/api/login', // Public API
        '/api/health' // Public API
    ];

    const adminRoutes = ['/admin'];

    // Check if the path is exactly a public route or starts with a public prefix
    const isPublic = publicRoutes.some(p => path === p || path.startsWith(`${p}/`));
    const isAdminRoute = adminRoutes.some(p => path.startsWith(p));
    const isApiRoute = path.startsWith('/api');

    // --- ACCESS CONTROL ---

    if (isPublic) {
        return NextResponse.next();
    }

    // --- PROTECTED ROUTE LOGIC (DEFAULT) ---
    // If we are here, the route is NOT public, so it MUST be protected.

    const sessionCookie = request.cookies.get('bacx_session')?.value;

    // --- REDIRECT AUTHENTICATED USERS AWAY FROM PUBLIC AUTH ROUTES ---
    // if (sessionCookie && (path.startsWith('/auth/login') || path.startsWith('/auth/signup'))) {
    //     return NextResponse.redirect(new URL('/dashboard', request.url));
    // }

    if (!sessionCookie) {
        if (isApiRoute) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Redirect to nowhere? Or maybe a dedicated 404 page?
        // Since routes are deleted, let's just let it fall through or redirect to root/custom 404
        // For now, redirect to root -> which might need handling if root is public
        // BUT user asked to avoid redirect loops.
        // If we redirect to /auth/login, it will 404. That's what they want.
        // So keeping it might be okay if the goal is to show the 404.
        // However, "avoid redirect loops".
        // Let's comment out the redirect to login.
        // return NextResponse.redirect(new URL('/auth/login', request.url));
        return NextResponse.redirect(new URL('/', request.url));
    }

    // For admin routes, do full validation including checking claims
    // For regular protected routes, just verify the token is valid (faster)
    const claims = await verifySessionCookie(sessionCookie, isAdminRoute);

    if (!claims) {
        // Invalid or expired token
        if (isApiRoute) {
            const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            response.cookies.delete('bacx_session');
            return response;
        }

        // const response = NextResponse.redirect(new URL('/auth/login', request.url));
        const response = NextResponse.redirect(new URL('/', request.url));
        // Clear the invalid cookie
        response.cookies.delete('bacx_session');
        return response;
    }

    // --- ADMIN ROUTE: CHECK ROLE IN JWT ---
    if (isAdminRoute) {
        // Check JWT claims for admin role
        const isAdmin = claims.role === 'admin' || claims.admin === true;

        if (!isAdmin) {
            if (isApiRoute) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            // User is authenticated but not admin
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'
    ],
};
