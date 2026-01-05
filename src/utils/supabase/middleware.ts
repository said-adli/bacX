import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create an unmodified response for public routes to avoid creating session cookies excessively?
    // No, Supabase needs to check the session everywhere to handle refresh tokens securely.

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // IMPORTANT: Avoid writing complex logic in middleware that queries the DB.
    // Just getUser() to validate auth token.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;

    // --- PROTECTED ROUTES ---
    // If no user, and trying to access protected route (dashboard, admin, etc)
    const isProtectedRoute =
        path.startsWith('/dashboard') ||
        path.startsWith('/admin') ||
        path.startsWith('/complete-profile');

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // --- AUTH ROUTES ---
    // If user exists, and trying to access login/signup
    const isAuthRoute = path.startsWith('/auth') || path.startsWith('/login');

    if (isAuthRoute && user) {
        // Smart Redirect based on role/completion could happen here,
        // But usually safer to let the Page/Context handle specifics or redirect to dashboard default.
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response
}
