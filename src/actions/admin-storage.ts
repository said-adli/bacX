"use server";

import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "@/utils/supabase/server";

/**
 * Generates a temporary Signed URL for a private file.
 * Only accessible by Admins.
 */
export async function getAdminSignedUrl(bucket: string, path: string) {
    try {
        const { supabase } = await verifyAdmin();

        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 60); // 1 minute expiry

        if (error) throw error;

        return { success: true, url: data.signedUrl };
    } catch (error: unknown) {
        console.error("Signed URL Error:", error);
        return { success: false, error: "Access Denied" };
    }
}
