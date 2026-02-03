"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "live";
    created_at: string;
    is_global: boolean;
    user_id?: string;
    target_audience?: string; // Backward compatibility
    read_by?: string[];
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
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper to check if read
    const isRead = (n: Notification) => {
        if (!user) return false;
        return n.read_by?.includes(user.id);
    };

    const unreadCount = notifications.filter(n => !isRead(n)).length;

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch global or user specific
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .or(`is_global.eq.true,user_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setNotifications(data as Notification[]);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to realtime
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload: RealtimePostgresChangesPayload<Notification>) => {
                    const newNotif = payload.new as Notification;
                    // Filter if relevant
                    if (newNotif.is_global || newNotif.user_id === user?.id || !newNotif.user_id) { // !newNotif.user_id assumes global if simpler
                        setNotifications(prev => [newNotif, ...prev]);
                        toast(newNotif.title, { description: newNotif.message });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const pushNotification = async (title: string, message: string, type: Notification["type"] = "info", isGlobal: boolean = true) => {
        if (!user) return;

        try {
            const { error } = await supabase.from('notifications').insert({
                title,
                message,
                type,
                is_global: isGlobal,
                user_id: isGlobal ? null : user.id,
                target_audience: isGlobal ? null : user.id, // Backward compatibility
                created_at: new Date().toISOString(),
            });

            if (error) throw error;
            // Optimization: Realtime listener will catch this and update UI
            // But for instant feedback on sender side:
            toast.success("Notification sent!");
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

        const currentReads = targetNotification.read_by || [];
        if (currentReads.includes(user.id)) return;

        const newReads = [...currentReads, user.id];

        // Optimistic update
        setNotifications(prev => prev.map(n => {
            if (n.id === id) {
                return { ...n, read_by: newReads };
            }
            return n;
        }));

        // DB Update
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read_by: newReads })
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error("Error persisting read status:", err);
            toast.error("Failed to update status");
            // Revert optimistic update if needed, but for now we keep UI responsive
        }
    };

    const clearAll = () => {
        setNotifications([]);
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
