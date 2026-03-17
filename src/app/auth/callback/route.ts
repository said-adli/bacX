import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // If "next" or "redirect_to" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? searchParams.get('redirect_to') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // For Vercel
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                // Local development
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                // Production with Vercel proxy
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
