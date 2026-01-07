import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

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

    // LIGHTWEIGHT: Use getSession() instead of getUser() 
    // getSession() reads from cookie, getUser() hits Supabase API
    const { data: { session } } = await supabase.auth.getSession()

    const path = request.nextUrl.pathname;

    // --- PROTECTED ROUTES ---
    const isProtectedRoute =
        path.startsWith('/dashboard') ||
        path.startsWith('/admin') ||
        path.startsWith('/complete-profile') ||
        path.startsWith('/subject') ||
        path.startsWith('/video') ||
        path.startsWith('/subscription') ||
        path.startsWith('/profile');

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // --- AUTH ROUTES ---
    const isAuthRoute = path.startsWith('/auth') || path.startsWith('/login');

    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response
}
