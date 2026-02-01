import { createBrowserClient } from '@supabase/ssr'

// SINGLETON PATTERN: Prevent multiple instances of the Supabase client
// caused by React strict mode, hot reloading, or component re-renders.
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
    if (client) {
        console.log('🔌 Supabase Client: Returning existing instance');
        return client;
    }

    console.log('🔌 Supabase Client: Creating NEW instance');
    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    return client
}
