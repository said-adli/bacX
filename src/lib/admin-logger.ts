import { createAdminClient } from "@/utils/supabase/admin";

export type AdminActionType =
    | "BAN_USER"
    | "UNBAN_USER"
    | "ACTIVATE_SUBSCRIPTION"
    | "EXTEND_SUBSCRIPTION"
    | "APPROVE_PAYMENT"
    | "REJECT_PAYMENT"
    | "CREATE_CONTENT"
    | "UPDATE_CONTENT"
    | "DELETE_CONTENT"
    | "UPDATE_GLOBAL_SETTINGS";

interface LogAdminActionParams {
    adminId: string;
    action: AdminActionType;
    targetId?: string;
    details?: Record<string, any>;
}

export async function logAdminAction({ adminId, action, targetId, details }: LogAdminActionParams) {
    const supabase = createAdminClient();

    try {
        // We use 'admin_logs' if it exists. If not, this will fail gracefully or we can create it.
        // Ideally this table should be created in Supabase SQL Editor.
        // 
        // Table Schema:
        // create table admin_logs (
        //   id uuid default gen_random_uuid() primary key,
        //   admin_id uuid references auth.users(id),
        //   action text not null,
        //   target_id text,
        //   details jsonb,
        //   created_at timestamptz default now()
        // );

        const { error } = await supabase.from('admin_logs').insert({
            admin_id: adminId,
            action,
            target_id: targetId,
            details,
        });

        if (error) {
            console.warn("Failed to write to admin_logs:", error);
        }
    } catch (err) {
        console.warn("Exception logging admin action:", err);
    }
}
