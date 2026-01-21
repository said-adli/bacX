'use client';

import { sendGlobalAnnouncement, getRecentAnnouncements } from "@/actions/admin-broadcast";
import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Megaphone, BellRing, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

export default function BroadcastPage() {
    const [message, setMessage] = useState("");
    const [type, setType] = useState<'info' | 'warning' | 'success' | 'urgent'>('info');
    const [history, setHistory] = useState<any[]>([]);

    // Simple client-side fetch for history on mount
    useEffect(() => {
        getRecentAnnouncements().then(res => setHistory(res.announcements));
    }, []);

    const handleSend = async () => {
        if (!message.trim()) return;

        // Optimistic UI could go here
        const res = await sendGlobalAnnouncement(message, type);

        if (res.success) {
            toast.success("Broadcast sent successfully!");
            setMessage("");
            getRecentAnnouncements().then(r => setHistory(r.announcements)); // Refresh list
        } else {
            toast.error("Failed to send broadcast.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Broadcast Center</h1>
                <p className="text-gray-400">Manage global announcements and alerts</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Sender Form */}
                <AdminGlassCard>
                    <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-blue-400" />
                        New Announcement
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm text-gray-400">Message Content</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="h-32 w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white focus:border-blue-500/50 focus:outline-none"
                                placeholder="Write your message here..."
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-gray-400">Alert Type</label>
                            <div className="flex gap-2">
                                {(['info', 'success', 'warning', 'urgent'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`flex-1 rounded-lg border py-2 text-sm font-bold capitalize transition-all ${type === t
                                                ? 'bg-white/10 border-white/20 text-white shadow-inner'
                                                : 'bg-transparent border-white/5 text-gray-500 hover:bg-white/5'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSend}
                            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                        >
                            Send Broadcast
                        </button>
                    </div>
                </AdminGlassCard>

                {/* Live Preview / History */}
                <AdminGlassCard>
                    <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-purple-400" />
                        Recent Alerts
                    </h3>

                    <div className="space-y-3">
                        {history.length === 0 && <p className="text-gray-500 text-sm">No recent announcements.</p>}
                        {history.map((item) => (
                            <div key={item.id} className="flex items-start gap-4 rounded-xl bg-white/5 p-3">
                                <div className={`mt-1 rounded-full p-1 ${item.type === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                        item.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                            item.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                                'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {item.type === 'urgent' ? <AlertTriangle className="h-4 w-4" /> :
                                        item.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                                            <Info className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{item.message}</p>
                                    <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminGlassCard>
            </div>
        </div>
    );
}
