import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

export async function verifyAdmin() {
    const supabase = await createClient();

    // 1. Check Auth (Session)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized: No active session");
    }

    // 2. Check Role (DB) - FORCE REFRESH LOGIC MIGHT BE NEEDED HERE IF CACHING IS AN ISSUE
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError) {
        // CRITICAL: Log the actual error code to see if it's RLS or connection
        throw new Error("Unauthorized: Profile lookup failed");
    }

    if (!profile) {
        throw new Error("Unauthorized: Profile not found");
    }

    if (profile.role !== 'admin') {
        throw new Error("Forbidden: Admin access required");
    }

    return { user, supabase };
}
