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

    // Map legacy table names to new resource types
    let resourceType = "";
    if (table === "subjects") resourceType = "subject";
    else if (table === "coupons") resourceType = "coupon";
    else if (table === "profiles") resourceType = "user";

    const { error } = await supabase.rpc("toggle_resource_status", {
        resource_id: id,
        resource_type: resourceType,
        field: field,
        new_status: newValue
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
