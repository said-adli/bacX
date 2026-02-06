"use client";

import { createContext, useContext, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import useSWR from "swr";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "live";
    created_at: string;
    is_global: boolean;
    user_id?: string;
    target_audience?: string; // Backward compatibility
    user_notifications?: { id: string }[]; // Joined table for read status
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    pushNotification: (title: string, message: string, type?: Notification["type"], isGlobal?: boolean) => Promise<void>;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const supabase = createClient();
    const { user } = useAuth();

    // Fetcher for SWR
    const fetchNotifications = async () => {
        if (!user) return [];
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*, user_notifications(id)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as Notification[];
        } catch (err) {
            console.error("Error fetching notifications:", err);
            return [];
        }
    };

    // SWR Hook - Smart Polling
    // Key includes user.id to reset on login switch
    // Interval: 5 minutes (300,000ms)
    // Focus: Revalidates immediately when user comes back to tab
    const { data: notifications = [], isLoading: loading, mutate } = useSWR(
        user ? ['notifications', user.id] : null,
        fetchNotifications,
        {
            refreshInterval: 300000,
            revalidateOnFocus: true,
            keepPreviousData: true
        }
    );

    // Helper to check if read
    const isRead = (n: Notification) => {
        if (!user) return false;
        // If the joined array has any entries, it means the user has read it
        return (n.user_notifications?.length ?? 0) > 0;
    };

    const unreadCount = notifications.filter(n => !isRead(n)).length;

    const pushNotification = async (title: string, message: string, type: Notification["type"] = "info") => {
        if (!user) return;

        try {
            const { error } = await supabase.from('notifications').insert({
                title,
                message,
                type,
                // is_global removed - strictly user targeted now
                is_global: false,
                user_id: user.id,
                target_audience: user.id, // Backward compatibility
                created_at: new Date().toISOString(),
            });

            if (error) throw error;
            toast.success("Notification sent!");

            // Revalidate immediately to show own sent notification if relevant, 
            // or just ensure consistency.
            mutate();
        } catch (err) {
            console.error("Error sending notification:", err);
            toast.error("Failed to send notification");
        }
    };

    const markAsRead = async (id: string) => {
        if (!user) return;

        // Find notification to calculate new state
        const targetNotification = notifications.find(n => n.id === id);
        if (!targetNotification) return;

        if (isRead(targetNotification)) return;

        // Optimistic update
        mutate(
            (currentData) => {
                return currentData?.map(n => {
                    if (n.id === id) {
                        return { ...n, user_notifications: [{ id: 'temp-optimistic-id' }] };
                    }
                    return n;
                });
            },
            { revalidate: false } // Don't refetch immediately, assume success
        );

        // DB Update: Insert into junction table
        try {
            const { error } = await supabase
                .from('user_notifications')
                .insert({
                    user_id: user.id,
                    notification_id: id
                });

            // Ignore duplicate key error (if user double clicked)
            if (error && error.code !== '23505') throw error;

            // Eventually revalidate to get real IDs or Ensure consistency
            mutate();
        } catch (err) {
            console.error("Error persisting read status:", err);
            toast.error("Failed to update status");
            // Trigger actual re-fetch to revert to truth
            mutate();
        }
    };

    const clearAll = () => {
        // Technically this should probably mark all as read or just clear local view?
        // Implementation said "setNotifications([])". 
        // With SWR, we can mutate to empty array locally.
        mutate([], { revalidate: false });
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, loading, pushNotification, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
