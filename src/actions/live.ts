'use server';

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Helper to verify admin role
async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");
    return createAdminClient();
}

export async function toggleLiveStream(data: { isLive: boolean; youtubeId: string; title: string; subject: string }) {
    try {
        const admin = await requireAdmin();

        // 1. If starting live, ensure no other live session is active? Or just insert new one.
        // We'll assume one active live session at a time for now.
        if (data.isLive) {
            // End any currently live sessions?
            await admin.from('live_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('status', 'live');

            const { error } = await admin.from('live_sessions').insert({
                title: data.title,
                youtube_id: data.youtubeId,
                subject: data.subject,
                status: 'live',
                started_at: new Date().toISOString(),
                viewer_count: 0
            });
            if (error) throw error;
        } else {
            // Stop live
            await admin.from('live_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('status', 'live');
        }

        return { success: true };
    } catch (e) {
        return { success: false, message: String(e) };
    }
}

export async function archiveStream(youtubeId: string, title: string, subject: string, type: 'lesson' | 'exercise') {
    try {
        const admin = await requireAdmin();

        // 1. End the live session
        await admin.from('live_sessions')
            .update({ status: 'ended', ended_at: new Date().toISOString() })
            .eq('youtube_id', youtubeId);

        // 2. Add to Lessons Library
        // We need the subject_id. Since we pass 'Physics', 'Math' strings from dashboard, we should lookup ID.
        // For now, let's assume the passed subject matches the ID or handle mapping.
        // In database seed, subject IDs are 'math', 'physics', etc (lowercase).
        const subjectId = subject.toLowerCase();

        const { error } = await admin.from('lessons').insert({
            id: crypto.randomUUID(),
            subject_id: subjectId,
            title: title || "Live Session Archive",
            duration: "Recorded Live", // Placeholder
            video_url: youtubeId,
            type: type
        });

        if (error) throw error;

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: String(e) };
    }
}
