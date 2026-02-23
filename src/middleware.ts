import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. MAINTENANCE MODE CHECK
    // Set NEXT_PUBLIC_MAINTENANCE_MODE="true" in Vercel/System Env to activate.
    if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
        // Allow access to maintenance page itself to avoid loops
        if (!request.nextUrl.pathname.startsWith('/maintenance')) {
            return NextResponse.redirect(new URL('/maintenance', request.url));
        }
    }

    // 2. CSP & SECURITY HEADERS (Nonce-based)
    const nonce = crypto.randomUUID();

    // Strict CSP Policy
    // Note: 'unsafe-eval' might be needed for some dev tools or specific libraries, keeping for now but 'unsafe-inline' is replaced by nonce.
    // 'unsafe-inline' for styles is often needed for various UI libraries, keeping strict primarily for scripts.
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://www.youtube.com https://img.youtube.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.supabase.co https://lh3.googleusercontent.com https://*.googleusercontent.com https://img.youtube.com https://via.placeholder.com;
        font-src 'self' data: https://fonts.gstatic.com;
        connect-src 'self' https://*.supabase.co wss://*.supabase.co;
        frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    // 2. AUTH & SESSION UPDATE
    // Pass updated headers to the Supabase middleware
    return await updateSession(request, requestHeaders);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
