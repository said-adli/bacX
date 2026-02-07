import { createClient } from "@/utils/supabase/server";

export async function logAdminAction(
    action: string,
    targetId: string | undefined,
    targetType: string,
    details: Record<string, unknown> = {}
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Should not happen in admin actions, but safe check

        await supabase.from('admin_audit_logs').insert({
            admin_id: user.id,
            action,
            target_id: targetId,
            target_type: targetType,
            details
        });
    } catch (error) {
        // We do NOT want to crash the main action if logging fails, 
        // but we should output to server console.
        console.error("AUDIT LOG ERROR:", error);
    }
}
