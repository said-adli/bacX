"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidateTag, revalidatePath } from "next/cache";

type AllowedTable = "subjects" | "coupons" | "profiles";

export async function toggleStatusAction(
    table: AllowedTable,
    id: string,
    field: string,
    newValue: boolean
) {
    const supabase = await createClient();

    const { error } = await supabase.rpc("toggle_resource_status", {
        table_name: table,
        record_id: id,
        field_name: field,
        new_value: newValue
    });

    if (error) {
        console.error("Toggle Status Error:", error);
        throw new Error("Failed to update status");
    }

    // Smart Revalidation based on table
    if (table === "subjects") {
        revalidateTag("subjects", "max");
        revalidatePath("/admin/content");
        revalidatePath("/dashboard");
    } else if (table === "coupons") {
        revalidateTag("coupons", "max");
        revalidatePath("/admin/coupons");
    } else if (table === "profiles") {
        revalidateTag("profiles", "max");
        // Also revalidate "users" just in case
        revalidateTag("users", "max");
        revalidatePath("/admin/users");
        revalidatePath("/admin/students");
    }
}
