import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.warn("⚠️ SUPABASE KEYS MISSING - Client creation bypassed ⚠️")
        // Return a dummy object that mimics the Supabase client structure to prevent crashing
        // This is a minimal mock for the parts we know are used (auth.getSession, auth.onAuthStateChange)
        const queryBuilder: any = {
            select: () => queryBuilder,
            eq: () => queryBuilder,
            single: async () => ({ data: null, error: null }),
            update: () => queryBuilder,
            insert: () => queryBuilder,
            match: () => queryBuilder,
            url: new URL("http://localhost"),
            headers: {},
            then: (resolve: any) => resolve({ data: [], error: null })
        }

        return {
            auth: {
                getSession: async () => ({ data: { session: null }, error: null }),
                getUser: async () => ({ data: { user: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signOut: async () => ({ error: null }),
                signInWithPassword: async () => ({ error: { message: "Supabase keys missing" } }),
                signUp: async () => ({ error: { message: "Supabase keys missing" } }),
                updateUser: async () => ({ error: null }),
            },
            from: () => queryBuilder,
        } as any
    }

    return createBrowserClient(supabaseUrl, supabaseKey)
}
