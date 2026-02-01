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

    // 2. AUTH & SESSION UPDATE
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
