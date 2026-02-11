"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

/**
 * Generates a short hash from the access token to identify sessions
 * without storing the raw token.
 */
function hashToken(token: string): string {
    // Use a simple deterministic hash (first 16 chars of base64)
    // This is NOT cryptographic — it's just a session fingerprint.
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Upsert a session record on login.
 * Called from AuthContext on SIGNED_IN.
 */
export async function upsertSession(terminalInfo: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "No session" };

    const sessionToken = hashToken(session.access_token);

    // Get IP from request headers
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || headersList.get("x-real-ip") || null;

    const { error } = await supabase
        .from("user_sessions")
        .upsert(
            {
                user_id: user.id,
                session_token: sessionToken,
                terminal_info: terminalInfo,
                ip_address: ip,
                last_active: new Date().toISOString(),
            },
            { onConflict: "user_id,session_token" }
        );

    if (error) {
        console.error("Session Upsert Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true, sessionToken };
}

export interface SessionRecord {
    id: string;
    session_token: string;
    terminal_info: string;
    ip_address: string | null;
    last_active: string;
    created_at: string;
}

/**
 * Fetch all active sessions for the current user.
 */
export async function getActiveSessions(): Promise<{ sessions: SessionRecord[]; currentToken: string | null }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { sessions: [], currentToken: null };

    const { data: { session } } = await supabase.auth.getSession();
    const currentToken = session ? hashToken(session.access_token) : null;

    const { data, error } = await supabase
        .from("user_sessions")
        .select("id, session_token, terminal_info, ip_address, last_active, created_at")
        .eq("user_id", user.id)
        .order("last_active", { ascending: false });

    if (error) {
        console.error("Fetch Sessions Error:", error);
        return { sessions: [], currentToken };
    }

    return {
        sessions: (data || []) as SessionRecord[],
        currentToken,
    };
}

/**
 * Delete all sessions except the current one.
 * Should be called alongside supabase.auth.signOut({ scope: "others" }).
 */
export async function deleteOtherSessions() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "No session" };

    const currentToken = hashToken(session.access_token);

    const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", user.id)
        .neq("session_token", currentToken);

    if (error) {
        console.error("Delete Other Sessions Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
