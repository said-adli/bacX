"use server";

import { createClient } from "@/utils/supabase/server";

export type NotificationType = "info" | "warning" | "success" | "live";

/**
 * Sends a notification to a specific user.
 */
export async function sendNotification(userId: string, title: string, message: string, type: NotificationType = "info", link?: string) {
    const supabase = await createClient();

    const { error } = await supabase.from('notifications').insert({
        title,
        message,
        type,
        user_id: userId,
        target_audience: userId, // Backward compatibility
        created_at: new Date().toISOString(),
        is_global: false,
    });

    if (error) {
        console.error("Failed to send notification:", error);
        throw new Error("Failed to send notification");
    }
}

/**
 * Batch-inserts a notification for all active students.
 */
export async function sendGlobalNotification(title: string, message: string, type: NotificationType = "info", link?: string) {
    const supabase = await createClient();

    // Fetch all active students
    const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

    if (studentsError) {
        console.error("Failed to fetch students for global notification:", studentsError);
        throw new Error("Failed to fetch students");
    }

    if (!students || students.length === 0) return;

    // Create the payload array for batch insertion
    const notificationsInsert = students.map(student => ({
        title,
        message,
        type,
        user_id: student.id,
        target_audience: student.id, // Backward compatibility
        created_at: new Date().toISOString(),
        is_global: false, // Keeping it false since we are inserting Individual rows
    }));

    // Perform batch insert
    const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsInsert);

    if (insertError) {
        console.error("Failed to send global notification:", insertError);
        throw new Error("Failed to send global notification");
    }
}

/**
 * Marks all notifications as read for a given user.
 */
export async function markAllAsReadAction(userId: string) {
    const supabase = await createClient();

    // 1. Get all unread notifications for the user
    // Unread means there is no record in user_notifications for this user & notification

    // First, fetch the user's notifications
    const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId);

    if (notifError || !notifications) {
        console.error("Failed to fetch notifications for markAllAsRead:", notifError);
        return;
    }

    // Now, fetch all already read notifications from the junction table
    const { data: readRecords, error: readError } = await supabase
        .from('user_notifications')
        .select('notification_id')
        .eq('user_id', userId);

    if (readError) {
        console.error("Failed to fetch read records:", readError);
        return;
    }

    const readSet = new Set(readRecords?.map(r => r.notification_id) || []);

    // Find completely unread ones
    const unreadIds = notifications
        .map(n => n.id)
        .filter(id => !readSet.has(id));

    if (unreadIds.length === 0) return; // Nothing to mark

    // Create insert payloads
    const readInserts = unreadIds.map(notifId => ({
        user_id: userId,
        notification_id: notifId
    }));

    // Batch insert into the junction table
    const { error: insertError } = await supabase
        .from('user_notifications')
        .insert(readInserts);

    if (insertError) {
        // Just ignore if there are some duplicates handled by a unique constraint, otherwise log
        if (insertError.code !== '23505') {
            console.error("Failed to mark all as read:", insertError);
        }
    }
}
