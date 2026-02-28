"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Shield, Smartphone, Monitor, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { revokeDevice } from "@/actions/admin-security";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeviceSession {
    id: string;
    device_name: string;
    last_active: string;
    profiles: {
        email: string;
        full_name: string | null;
        role: string;
    } | null;
}

export default function DeviceSecurityClient({ sessions }: { sessions: DeviceSession[] }) {
    const router = useRouter();

    const handleRevoke = async (id: string, name: string) => {
        if (!confirm(`Revoke access for ${name}?`)) return;

        try {
            await revokeDevice(id);
            toast.success("Session revoked");
            router.refresh(); // Refresh list
        } catch (_err) {
            toast.error("Failed to revoke session");
        }
    }

    return (
        <div className="container mx-auto max-w-7xl pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Shield className="text-red-500" /> Device Security
                    </h2>
                    <p className="text-zinc-500">Monitor and manage active user sessions.</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-500 text-sm font-bold">
                    {sessions.length} Active Sessions
                </div>
            </div>

            <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400">
                        <tr>
                            <th className="p-4 font-normal">User</th>
                            <th className="p-4 font-normal">Device</th>
                            <th className="p-4 font-normal">Last Active</th>
                            <th className="p-4 font-normal text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold">{session.profiles?.full_name || "Unknown"}</span>
                                        <span className="text-zinc-500 text-xs">{session.profiles?.email}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        {session.device_name.toLowerCase().includes("mobile") ? <Smartphone size={16} /> : <Monitor size={16} />}
                                        {session.device_name}
                                    </div>
                                </td>
                                <td className="p-4 text-zinc-500 text-sm">
                                    {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleRevoke(session.id, session.device_name)}
                                        className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        Revoke
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}
