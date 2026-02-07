"use server";


import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * Generic Toggle Action for Admin Dashboard
 * Optimistic UI should rely on this returning void/error to rollback if needed.
 */
export async function toggleStatus(
    table: string,
    id: string,
    field: string,
    value: boolean
) {
    // 1. Verify Admin Role (Centralized)
    await requireAdmin();

    // 2. Perform Update using Admin Client
    // This allows updating any table (lessons, users, plans) without fighting strict RLS for specific fields
    const adminClient = createAdminClient();

    // Whitelist tables for safety (Optional but recommended)
    const allowedTables = ['lessons', 'modules', 'units', 'subscription_plans', 'profiles', 'coupons'];
    if (!allowedTables.includes(table)) {
        throw new Error(`Table ${table} is not whitelisted for generic toggle.`);
    }

    // Dynamic field update - type assertion needed for dynamic key
    interface ToggleUpdate { [key: string]: boolean }
    const updatePayload: ToggleUpdate = { [field]: value };

    const { error } = await adminClient
        .from(table)
        .update(updatePayload)
        .eq('id', id);

    if (error) {
        console.error(`Toggle failed for ${table}.${field}:${id}`, error);
        throw new Error("Update failed");
    }

    // 3. Revalidate
    // We can be smart about this or just verify path.
    // For now, revalidate the admin root to catch most lists.
    revalidatePath('/admin');
    revalidatePath('/dashboard');
}
