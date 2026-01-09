import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // HEARTBEAT: Entry
    console.log(`>> MIDDLEWARE_IN: ${request.nextUrl.pathname}`);

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // BYPASS: If keys are missing (e.g. during nuclear reset/dev), skip auth
    if (!supabaseUrl || !supabaseKey) {
        console.warn("⚠️ SUPABASE KEYS MISSING - Bypassing auth middleware for development ⚠️")
        return response
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // LIGHTWEIGHT: Use getSession() instead of getUser() - reads from cookie only
    const { data: { session } } = await supabase.auth.getSession()

    const path = request.nextUrl.pathname;

    // DIAGNOSTIC: Add trace header
    response.headers.set('x-middleware-trace', `hit:${Date.now()}`);

    // Protected routes
    const isProtectedRoute =
        path.startsWith('/dashboard') ||
        path.startsWith('/admin') ||
        path.startsWith('/complete-profile') ||
        path.startsWith('/subject') ||
        path.startsWith('/video') ||
        path.startsWith('/subscription') ||
        path.startsWith('/profile');

    if (isProtectedRoute && !session) {
        console.log(`<< MIDDLEWARE_OUT: ${path} (REDIRECT to login)`);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Auth routes redirect
    const isAuthRoute = path.startsWith('/auth') || path.startsWith('/login');
    if (isAuthRoute && session) {
        console.log(`<< MIDDLEWARE_OUT: ${path} (REDIRECT to dashboard)`);
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // HEARTBEAT: Exit
    console.log(`<< MIDDLEWARE_OUT: ${path}`);
    return response
}
