"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type ReorderTable = "subjects" | "units" | "lessons";

export async function reorderItems(
    table: ReorderTable,
    orderedIds: string[],
    pathToRevalidate: string = "/admin/content"
) {
    const supabase = await createClient();

    // Transform array of IDs into array of { id, order_index: index }
    const updates = orderedIds.map((id, index) => ({
        id,
        order_index: index
    }));

    const { error } = await supabase.rpc("reorder_items", {
        table_name: table,
        updates: updates
    });

    if (error) {
        console.error("Reorder failed:", error);
        throw new Error("Failed to reorder items");
    }

    revalidatePath(pathToRevalidate);
    revalidatePath('/admin/live');
    revalidatePath('/dashboard');
    revalidatePath('/admin/content');
}
