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
        console.error("DEBUG [verifyAdmin]: No Session or Auth Error", authError);
        throw new Error("Unauthorized: No active session");
    }

    // 2. Check Role (DB)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error(`DEBUG [verifyAdmin]: Profile Error for User ${user.email} (${user.id}):`, profileError);
        throw new Error("Unauthorized: Profile lookup failed");
    }

    if (!profile) {
        console.error(`DEBUG [verifyAdmin]: No Profile Found for User ${user.email} (${user.id})`);
        throw new Error("Unauthorized: Profile not found");
    }

    console.log(`DEBUG [verifyAdmin]: Success. User: ${user.email}, Role: ${profile.role}`);

    if (profile.role !== 'admin') {
        console.error(`DEBUG [verifyAdmin]: Role Mismatch. Expected 'admin', Got '${profile.role}'`);
        throw new Error("Forbidden: Admin access required");
    }

    return { user, supabase };
}
