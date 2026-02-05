"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/admin-logger";
import { requireAdmin } from "@/lib/auth-guard";

export interface StudentProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    wilaya: string | null;
    study_system: string | null;
    created_at: string;
    is_restored: boolean;
    is_subscribed: boolean;
    subscription_end_date: string | null;
    is_banned: boolean;     // [NEW]
    avatar_url?: string;    // [NEW]
}

// FETCH STUDENTS
export async function getStudents(
    page = 1,
    query = "",
    filter: "all" | "active" | "expired" | "banned" = "all"
) {
    // Read-only can be done with standard client usually, as Admin RLS lets them see all.
    // For complete robustness, we can switch to AdminClient, but let's stick to standard for Reads 
    // to verify RLS "Select" works.
    const supabase = await createClient();
    const adminClient = createAdminClient(); // Fallback for some filters if needed without RLS.

    // Verify Admin
    await requireAdmin();

    // Use Admin Client for Querying to ensure we see EVERYTHING regardless of quirky RLS
    // (God Mode for Read as well)
    let dbQuery = adminClient
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, ((page - 1) * 10) + 9);

    if (query) {
        // Search by Name, Email, or Phone (if exists in metadata/profile)
        // Note: 'phone' might not be a top-level column on profiles depending on schema.
        // Assuming 'full_name' is on profiles. 'email' is usually on profiles too for convenience,
        // or we have to join auth.users (which we can't easily do with client sdk).
        // Let's assume profiles has these fields as per "StudentProfile" interface above?
        // Wait, interface only has: full_name, email, wilaya...
        // Let's check if 'phone' is in schema. If not, we search what we can.
        // SEARCH OPTIMIZATION: Prefix Search Only (Uses Index)
        dbQuery = dbQuery.or(`full_name.ilike.${query}%,email.ilike.${query}%`);
    }

    if (filter === 'active') {
        dbQuery = dbQuery.eq('is_subscribed', true);
    } else if (filter === 'expired') {
        dbQuery = dbQuery.eq('is_subscribed', false);
    }

    const { data, count, error } = await dbQuery;

    if (error) {
        console.error("Error fetching students:", error);
        throw new Error("Failed to fetch students");
    }

    return {
        students: data,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / 10) // 10 = PAGE_SIZE
    };
}

// ACTIONS

// TOGGLE BAN (God Mode)
export async function toggleBanStudent(userId: string, shouldBan: boolean) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify Admin
    // Verify Admin
    await requireAdmin();

    // 1. Update Profile (Visual) - Use Admin Client to bypass profile RLS
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ is_banned: shouldBan })
        .eq('id', userId);

    if (profileError) throw profileError;

    // 2. Update Auth User (Enforcement)
    if (shouldBan) {
        // Ban for 100 years
        await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
        await supabaseAdmin.auth.admin.signOut(userId); // Force Logout
    } else {
        await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "0" });
    }

    revalidatePath('/admin/students');
}

// MANUAL EXPIRY / TERMINATE
export async function manualsExpireSubscription(userId: string) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify Admin
    // Verify Admin
    await requireAdmin();

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            is_subscribed: false,
            subscription_end_date: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/students');
}

// EXTEND SUBSCRIPTION (God Mode)
export async function extendSubscription(userId: string, daysToAdd: number) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify Admin
    // Verify Admin
    await requireAdmin();

    // Get current profile
    const { data: profileData } = await supabaseAdmin.from('profiles').select('subscription_end_date, is_subscribed').eq('id', userId).single();
    if (!profileData) throw new Error("Profile not found");

    let newEndDate = new Date();
    // If currently valid, add to end date
    if (profileData.is_subscribed && profileData.subscription_end_date && new Date(profileData.subscription_end_date) > new Date()) {
        newEndDate = new Date(profileData.subscription_end_date);
    }
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            is_subscribed: true,
            subscription_end_date: newEndDate.toISOString()
        })
        .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/students');
}
// ------------------------------------------------------------------
// NEW: Student Detail View Actions
// ------------------------------------------------------------------

export async function getStudentDetails(studentId: string) {
    const supabaseAdmin = createAdminClient();

    // 1. Fetch Profile (Identity)
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

    if (profileError || !profile) {
        console.error("Profile fetch error:", profileError);
        return null;
    }

    // 2. Parallel Fetch: Payments, Logs, Progress
    const [paymentsResult, securityLogsResult, progressResult] = await Promise.all([
        // Fetch Payments
        supabaseAdmin
            .from('payment_receipts')
            .select('*')
            .eq('user_id', studentId)
            .order('created_at', { ascending: false }),

        // Fetch Security Logs
        supabaseAdmin
            .from('security_logs')
            .select('*')
            .eq('user_id', studentId)
            .order('created_at', { ascending: false })
            .limit(5),

        // Fetch Progress
        supabaseAdmin
            .from('user_progress')
            .select('*, lessons(title)')
            .eq('user_id', studentId)
            .order('updated_at', { ascending: false })
            .limit(5)
    ]);

    const payments = paymentsResult.data || [];
    const securityLogs = securityLogsResult.data || [];
    const progress = progressResult.data || [];

    return {
        profile,
        payments: payments || [],
        securityLogs: securityLogs || [],
        recentProgress: progress || []
    };
}

// ------------------------------------------------------------------
// NEW: Masquerade / Magic Link
// ------------------------------------------------------------------

export async function generateImpersonationLink(userId: string) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // 1. Verify Admin (Redundant check but safe)
    // 1. Verify Admin (Redundant check but safe)
    await requireAdmin();

    // 2. Get Student Email
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

    if (!profile?.email) throw new Error("Student email not found");

    // 3. Generate Magic Link
    // Note: This sends an email by default unless we use 'generateLink' which returns the link.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: profile.email,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        }
    });

    if (error) {
        console.error("Masquerade failed:", error);
        throw new Error("Failed to generate link");
    }

    await logAdminAction('IMPERSONATE_USER', userId, 'user', { email: profile.email });
    return data.properties?.action_link;
}
// ------------------------------------------------------------------
// NEW: Bulk Actions
// ------------------------------------------------------------------

export async function bulkUpdateStudents(
    userIds: string[],
    action: 'ban' | 'unban' | 'expire'
) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // 1. Verify Admin
    // 1. Verify Admin
    await requireAdmin();

    // 2. Perform Actions
    if (action === 'ban' || action === 'unban') {
        const isBanned = action === 'ban';

        // RPC replaces the N+1 Loop + Profile Update
        const { error } = await supabaseAdmin.rpc('bulk_update_profiles', {
            student_ids: userIds,
            new_status: isBanned
        });

        if (error) {
            console.error("Bulk action failed:", error);
            throw new Error(`Failed to ${action} students`);
        }

    } else if (action === 'expire') {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                is_subscribed: false,
                subscription_end_date: new Date().toISOString()
            })
            .in('id', userIds);

        if (error) throw error;
    }

    revalidatePath('/admin/students');
}

// ------------------------------------------------------------------
// NEW: Manual Plan Assignment (The "Linker")
// ------------------------------------------------------------------

export async function setStudentPlan(userId: string, planId: string | null, isSubscribed: boolean) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify Admin
    // Verify Admin
    await requireAdmin();

    // Construct Update Object
    interface ProfileUpdate {
        is_subscribed: boolean;
        plan_id?: string;
        subscription_end_date?: string;
    }

    const updateData: ProfileUpdate = {
        is_subscribed: isSubscribed,
    };

    if (isSubscribed) {
        if (!planId) throw new Error("Plan ID is required for active subscriptions");
        updateData.plan_id = planId;

        // If enabling subscription, ensure valid end date if expired
        // We can fetch plan duration to be precise, or default to 1 year.
        // For MANUAL linkage, if we are just "fixing" a record, we might preserve existing date 
        // OR reset it. Let's reset to 1 year from now to be safe, or 30 days if not specified.
        // BETTER: Fetch Plan Duration.
        if (planId) {
            const { data: plan } = await supabaseAdmin.from('subscription_plans').select('duration_days').eq('id', planId).single();
            const days = plan?.duration_days || 365;
            updateData.subscription_end_date = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        }
    } else {
        // If deactivating, maybe clear plan_id? Or keep it for history?
        // Usually we keep it or set active_plan_id to null if we had that column.
        // Here we just set is_subscribed false.
        updateData.subscription_end_date = new Date().toISOString(); // Expire now
    }

    const { error } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

    if (error) throw error;

    await logAdminAction('UPDATE_SUBSCRIPTION', userId, 'user', { isSubscribed, planId });
    revalidatePath('/admin/students');
}

// ------------------------------------------------------------------
// FULL CRUD
// ------------------------------------------------------------------

export async function updateStudentProfile(userId: string, data: { fullName?: string, email?: string, wilaya?: string }) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify Admin
    // Verify Admin
    await requireAdmin();

    // Update Profile
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            full_name: data.fullName,
            email: data.email, // Note: Changing email in profile doesn't change it in Auth without extra steps usually
            wilaya: data.wilaya
        })
        .eq('id', userId);

    if (error) throw error;

    // Attempt Admin Auth Email Update if email changed
    if (data.email) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, { email: data.email });
        if (authError) console.error("Failed to update auth email:", authError);
    }

    await logAdminAction('UPDATE_STUDENT_PROFILE', userId, 'user', data);
    revalidatePath('/admin/students');
}

export async function deleteStudent(userId: string) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Verify Admin
    // Verify Admin
    await requireAdmin();

    // Cascade Delete handled by DB Foreign Keys preferably, but we can engage manual cleanup if needed.
    // Supabase Auth deletion cascades to profiles often if configured, or we delete user which deletes profile.

    // 1. Delete from Auth (this usually triggers cascading delete in public schema if configured)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        // Fallback: Try deleting profile directly if Auth delete fails or isn't linked
        console.error("Auth delete failed, trying profile:", error);
        const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
        if (profileError) throw profileError;
    }

    await logAdminAction('DELETE_STUDENT', userId, 'user', {});
    revalidatePath('/admin/students');
}
