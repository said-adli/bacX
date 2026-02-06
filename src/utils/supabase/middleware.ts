import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, customHeaders?: Headers) {
    let response = NextResponse.next({
        request: {
            headers: customHeaders || request.headers,
        },
    })

    // Ensure CSP is also on the response (for the browser to enforce)
    if (customHeaders?.has('Content-Security-Policy')) {
        response.headers.set('Content-Security-Policy', customHeaders.get('Content-Security-Policy')!);
    }

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

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    // This refreshes the session cookie if it's invalid/expired
    const { data: { user }, error } = await supabase.auth.getUser()

    // Protected Routes
    const path = request.nextUrl.pathname

    // Add logic here if needed, but the primary goal is ensuring session update works
    // The previous implementation had redirection logic here, preserving it.

    const isProtectedRoute =
        path.startsWith('/dashboard') ||
        path.startsWith('/admin') ||
        path.startsWith('/complete-profile') ||
        path.startsWith('/subject') ||
        path.startsWith('/video') ||
        path.startsWith('/subscription') ||
        path.startsWith('/settings') ||
        path.startsWith('/profile')

    const isAuthRoute = path.startsWith('/auth') || path.startsWith('/login')

    // Redirect if accessing protected route without user
    if (isProtectedRoute && (!user || error)) {
        const nextUrl = new URL('/login', request.url)
        nextUrl.searchParams.set('next', path)
        return NextResponse.redirect(nextUrl)
    }

    // Redirect if accessing auth route with user
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}
