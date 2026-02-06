import { SupabaseClient } from '@supabase/supabase-js';

type UserProfile = {
    id: string;
    role: string;
    plan_id?: string;
    is_subscribed?: boolean;
};

type ContentRequirement = {
    required_plan_id?: string | null;
    is_free?: boolean;
    published?: boolean;
};

/**
 * UNIFIED ACCESS CONTROL "THE IRON CURTAIN"
 * 
 * Centralized logic to verify if a user can access specific content.
 * Enforces:
 * 1. Admin/Teacher Bypass
 * 2. Published Status (unless Admin)
 * 3. Plan Matching (Strict Plan ID check)
 */
export async function verifyContentAccess(
    user: UserProfile,
    content: ContentRequirement
): Promise<{ allowed: boolean; reason?: string }> {

    // 1. Admin/Teacher Bypass
    if (user.role === 'admin' || user.role === 'teacher') {
        return { allowed: true, reason: 'admin_bypass' };
    }

    // 2. Published Check
    // If content has a 'published' flag and it is false, DENY.
    if (content.published === false) {
        return { allowed: false, reason: 'content_unpublished' };
    }

    // 3. Free Content Check
    if (content.is_free) {
        return { allowed: true, reason: 'content_free' };
    }

    // 4. Plan Match Check
    if (content.required_plan_id) {
        if (!user.is_subscribed) {
            return { allowed: false, reason: 'subscription_required' };
        }

        // Strict Plan ID Match
        if (user.plan_id !== content.required_plan_id) {
            return { allowed: false, reason: 'plan_mismatch' };
        }

        return { allowed: true, reason: 'plan_match' };
    }

    // Fallback / Default Deny if we can't determine
    return { allowed: false, reason: 'unknown_restriction' };
}
