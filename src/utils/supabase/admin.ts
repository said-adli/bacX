import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * SINGLETON PATTERN: Admin Client
 * 
 * Engineering Note:
 * - Prevents connection exhaustion on Supabase Free Tier (200 connection limit)
 * - Module-level variable ensures only ONE instance exists per server process
 * - Service Role key bypasses RLS - use only in trusted server-side contexts
 * - autoRefreshToken: false because service role tokens don't need refresh
 */
let adminClient: SupabaseClient | null = null;

export const createAdminClient = (): SupabaseClient => {
    // Return existing instance if available (SINGLETON)
    if (adminClient) {
        return adminClient;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey) {
        throw new Error("MISSING ENV: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");
    }

    // Create once, reuse forever
    adminClient = createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    return adminClient;
}
