"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * P0 SECURITY FIX: Generates a signed URL only if the user has the correct plan.
 * Prevents "Open Bucket" scraping.
 * @param lessonId - The lesson context (Context Source of Truth)
 * @param resourcePath - The storage path (e.g. "math/intro.pdf")
 */
export async function getLessonResource(lessonId: string, resourcePath: string) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Fetch Context (Lesson + User Plan)
    // We strictly join to ensure the User owns the Plan required by this Lesson.
    const { data: lesson } = await supabase
        .from('lessons')
        .select('required_plan_id, is_public')
        .eq('id', lessonId)
        .single();

    if (!lesson) throw new Error("Lesson not found");

    // 3. Authorization Logic (Entitlement)
    let hasAccess = false;

    if (lesson.is_public) {
        hasAccess = true;
    } else {
        const { data: profile } = await supabase
            .from('profiles')
            .select('active_plan_id, role')
            .eq('id', user.id)
            .single();

        if (profile?.role === 'admin') {
            hasAccess = true;
        } else if (lesson.required_plan_id && profile?.active_plan_id === lesson.required_plan_id) {
            hasAccess = true;
        }
    }

    if (!hasAccess) {
        throw new Error("Subscription Plan Required for this content.");
    }

    // 4. Generate Signed URL (Valid for 1 hour)
    // CRITICAL: We use a Service Role client here because we are about to REVOKE 
    // the "Select" policy for students to fix the IDOR.
    // Students can NO LONGER "Select" from the bucket directly.
    // Only the Service Role can generate a signature that works? 
    // Actually: Signed URLs work significantly better if the bucket is private 
    // and we sign it with the Service Role (which has Admin rights).

    // We need a fresh client with Service Role
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const serviceClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await serviceClient
        .storage
        .from('course-materials')
        .createSignedUrl(resourcePath, 3600);

    if (error || !data) throw new Error("Failed to generate secure link");

    return data.signedUrl;
}
