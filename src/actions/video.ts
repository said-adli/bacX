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
        .select('id, required_plan_id, is_free, video_url')
        .eq('id', lessonId)
        .single();

    if (!lesson) throw new Error("Lesson not found");

    // 4. Entitlement Logic
    const isAdmin = profile.role === 'admin';
    const isFree = lesson.is_free;
    const planMatch = lesson.required_plan_id ? profile.plan_id === lesson.required_plan_id : false;
    const isSubscribed = !!profile.is_subscribed;

    // Access Grant
    if (!isAdmin && !isFree && !planMatch && !(!lesson.required_plan_id && isSubscribed)) {
        if (lesson.required_plan_id) throw new Error("Upgrade required");
        throw new Error("Subscription required");
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
