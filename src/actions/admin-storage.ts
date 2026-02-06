"use server";

import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from '@/lib/auth-guard';

/**
 * Generates a temporary Signed URL for a private file.
 * Only accessible by Admins.
 * Valid for 1 hour (3600s).
 */
export async function getAdminSignedUrl(bucket: string, path: string) {
    // 1. Verify Admin Access
    await requireAdmin();
    const supabase = await createClient();

    // 2. Generate Signed URL
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
        console.error("Signed URL Error:", error);
        throw new Error("Failed to generate secure link");
    }

    return { success: true, url: data.signedUrl };
}
