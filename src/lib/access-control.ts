// Unified Access Control Module

type UserProfile = {
    id: string;
    role: string;
    plan_id?: string;
    is_subscribed?: boolean;
    owned_content_ids?: string[];
};

type ContentRequirement = {
    id?: string; // Content ID for ownership check
    required_plan_id?: string | null;
    is_free?: boolean;
    is_active?: boolean;
};

/**
 * UNIFIED ACCESS CONTROL "THE IRON CURTAIN"
 * 
 * Centralized logic to verify if a user can access specific content.
 * Enforces:
 * 1. Admin/Teacher Bypass
 * 2. Active Status (unless Admin)
 * 3. Plan Matching (Strict Plan ID check)
 * 4. Content Ownership (Lifetime Access)
 */
export async function verifyContentAccess(
    user: UserProfile,
    content: ContentRequirement
): Promise<{ allowed: boolean; reason?: string }> {

    // 1. Admin/Teacher Bypass
    if (user.role === 'admin' || user.role === 'teacher') {
        return { allowed: true, reason: 'admin_bypass' };
    }

    // 2. Active Check
    // If content has an 'is_active' flag and it is false, DENY.
    if (content.is_active === false) {
        return { allowed: false, reason: 'content_inactive' };
    }

    // 3. Ownership Check (Lifetime Access) - HIGHEST PRIORITY for Students
    // If the content ID is in the user's owned list, they get access regardless of subscription.
    // We check this BEFORE subscription because it's a stronger right.
    if (content.id && user.owned_content_ids?.includes(content.id)) {
        return { allowed: true, reason: 'lifetime_ownership' };
    }

    // 4. Free Content Check
    if (content.is_free) {
        return { allowed: true, reason: 'content_free' };
    }

    // 5. Plan Match Check
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
