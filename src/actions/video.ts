"use server";

import { createClient } from "@/utils/supabase/server";
import { createHmac } from "crypto";

const SERVER_SALT = process.env.VIDEO_ENCRYPTION_SALT || "default-secret-change-me";

export async function getSecureVideoId(lessonId: string) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 2. Fetch User Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, plan_id, is_subscribed')
        .eq('id', user.id)
        .single();

    if (!profile) throw new Error("Profile not found");

    // 3. Fetch Lesson
    const { data: lesson } = await supabase
        .from('lessons')
        .select('id, required_plan_id, is_free, video_url, units(subjects(published))') // Fetched published status
        .eq('id', lessonId)
        .single();

    if (!lesson) throw new Error("Lesson not found");

    // 4. Entitlement Logic (Unified)
    const { verifyContentAccess } = await import("@/lib/access-control");

    // Fetch Ownership
    const { data: ownership } = await supabase
        .from('user_content_ownership')
        .select('content_id')
        .eq('user_id', user.id)
        .eq('content_id', lesson.id)
        .maybeSingle();

    const ownedContentIds = ownership ? [ownership.content_id] : [];

    // @ts-ignore - Deep join type safety
    const units = Array.isArray(lesson.units) ? lesson.units[0] : lesson.units;
    // @ts-ignore
    const subjects = Array.isArray(units?.subjects) ? units.subjects[0] : units?.subjects;
    const published = subjects?.published ?? true;

    const contentRequirement = {
        id: lesson.id,
        required_plan_id: lesson.required_plan_id,
        is_free: lesson.is_free,
        published: published
    };

    const access = await verifyContentAccess({
        ...profile,
        owned_content_ids: ownedContentIds
    }, contentRequirement);

    if (!access.allowed) {
        // Map access reasons to specific errors if needed, or generic
        if (access.reason === 'upgrade_required') throw new Error("Upgrade required"); // map if needed
        throw new Error(access.reason || "Subscription required");
    }

    // 5. Generate HMAC Token
    const expiry = Date.now() + 60 * 1000; // 60 seconds
    const payload = `${lesson.id}:${user.id}:${expiry}`;
    const signature = createHmac('sha256', SERVER_SALT).update(payload).digest('hex');
    const token = `${Buffer.from(payload).toString('base64')}.${signature}`;

    return {
        videoId: lesson.video_url, // For immediate use if client needs it, but mostly opaque
        token,
        expiry
    };
}
