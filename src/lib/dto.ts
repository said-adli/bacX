export type SafeUser = {
    id: string;
    email: string | undefined;
};

export type SafeProfile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    is_subscribed: boolean;
};

// ... Add more strict types as needed

/**
 * Strips all internal Supabase metadata (app_metadata, user_metadata, identities, factors, etc.)
 * Returns only what the UI needs to display or uniquely identify the user.
 */
export function toSafeUserDTO(user: any): SafeUser | null {
    if (!user) return null;
    return {
        id: user.id,
        email: user.email,
        // intentionally omitting phone, phone_confirmed_at, email_confirmed_at, last_sign_in_at, app_metadata, user_metadata, identifies, created_at, updated_at
    };
}

/**
 * Strips sensitive profile information before sending to client components
 */
export function toSafeProfileDTO(profile: any): SafeProfile | null {
    if (!profile) return null;
    return {
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
        is_subscribed: profile.is_subscribed,
        // intentionally omitting wilaya_id, branch_id, phone, parent_phone, school, birth_date for global contexts
        // If a specific context needs these (like the profile editor), create a separate DTO: toProfileEditorDTO
    };
}

export type SafeBillingHistory = {
    id: string;
    amount: number;
    status: string;
    date: string;
    method: string;
    receipt_url: string | null;
};

/**
 * Strips user_id and other potential DB internals from billing history
 */
export function toSafeBillingHistoryDTO(historyRow: any): SafeBillingHistory {
    return {
        id: historyRow.id,
        amount: historyRow.amount,
        status: historyRow.status,
        date: historyRow.date,
        method: historyRow.method,
        receipt_url: historyRow.receipt_url,
    };
}
