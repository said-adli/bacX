"use client";

import { useState, useEffect } from "react";
import { getLiveSessions, createLiveSession, updateLiveSession, deleteLiveSession, LiveSession } from "@/actions/admin-live";
import { SubscriptionPlan, getAdminPlans } from "@/actions/admin-plans";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Video, Calendar, DollarSign, Lock, PlayCircle, ExternalLink, X, Save } from "lucide-react";
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";

// Using generic UI components or raw Tailwind
// Assuming GlassCard exists as seen in ContentEditor

export default function LiveSessionManager({ onJoinSession }: { onJoinSession?: (session: LiveSession) => void }) {
    const [sessions, setSessions] = useState<(LiveSession & { subscription_plans?: { name: string } })[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSession, setCurrentSession] = useState<Partial<LiveSession>>({});

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        const [sParams, pParams] = await Promise.all([getLiveSessions(), getAdminPlans()]);
        setSessions(sParams);
        setPlans(pParams);
        setIsLoading(false);
    }

    const handleSave = async () => {
        if (!currentSession.title || !currentSession.youtube_id || !currentSession.start_time) {
            toast.error("Please fill required fields (Title, YouTube ID, Start Time)");
            return;
        }

        try {
            const payload = {
                title: currentSession.title,
                youtube_id: currentSession.youtube_id,
                start_time: currentSession.start_time,
                status: currentSession.status || 'scheduled',
                required_plan_id: currentSession.required_plan_id || null,
                is_purchasable: currentSession.is_purchasable || false,
                price: currentSession.price || null,
                published: currentSession.published ?? true
            };

            if (currentSession.id) {
                await updateLiveSession(currentSession.id, payload);
                toast.success("Updated");
            } else {
                await createLiveSession(payload as any);
                toast.success("Created");
            }
            setIsEditing(false);
            setCurrentSession({});
            loadData();
        } catch (e) {
            console.error(e);
            toast.error("Failed to save");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this session?")) return;
        try {
            await deleteLiveSession(id);
            toast.success("Deleted");
            loadData();
        } catch (e) {
            toast.error("Error deleting");
        }
    };

    const openEditor = (session?: any) => {
        setCurrentSession(session || {
            status: 'scheduled',
            published: true,
            is_purchasable: false,
            start_time: new Date().toISOString().slice(0, 16) // Default to now-ish format for datetime-local
        });
        setIsEditing(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Video className="text-red-500" /> Live Sessions
                </h2>
                <button
                    onClick={() => openEditor()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-bold"
                >
                    <Plus size={18} /> New Session
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {sessions.map(s => (
                    <GlassCard key={s.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/20 transition-all">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${s.status === 'live' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 text-zinc-400'}`}>
                                <Video size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {s.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-1">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {format(new Date(s.start_time), 'MMM d, yyyy HH:mm')}
                                    </span>
                                    {s.required_plan_id ? (
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            <Lock size={10} /> {s.subscription_plans?.name || 'Plan Required'}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Public</span>
                                    )}

                                    {s.is_purchasable && (
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            <DollarSign size={10} /> {s.price ? `${s.price} DA` : 'Paid'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {s.status === 'live' && onJoinSession && (
                                <button
                                    onClick={() => onJoinSession(s)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 animate-pulse"
                                >
                                    <PlayCircle size={16} /> JOIN ROOM
                                </button>
                            )}

                            <a
                                href={`https://youtu.be/${s.youtube_id}`}
                                target="_blank"
                                className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                title="Open YouTube"
                            >
                                <ExternalLink size={18} />
                            </a>
                            <button
                                onClick={() => openEditor(s)}
                                className="p-2 hover:bg-blue-500/10 rounded-lg text-zinc-400 hover:text-blue-400 transition-colors"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(s.id)}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </GlassCard>
                ))}
                {sessions.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-zinc-500">No sessions found. Create one to start.</div>
                )}
            </div>

            {/* Modal Editor */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">{currentSession.id ? 'Edit Session' : 'New Session'}</h3>
                            <button onClick={() => setIsEditing(false)}><X className="text-zinc-500 hover:text-white" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Title</label>
                                <input
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    value={currentSession.title || ''}
                                    onChange={e => setCurrentSession({ ...currentSession, title: e.target.value })}
                                    placeholder="e.g. Weekly QA Session"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">YouTube ID</label>
                                    <input
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-mono"
                                        value={currentSession.youtube_id || ''}
                                        onChange={e => setCurrentSession({ ...currentSession, youtube_id: e.target.value })}
                                        placeholder="Video ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Schedule Start</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                        value={currentSession.start_time ? new Date(currentSession.start_time).toISOString().slice(0, 16) : ''}
                                        onChange={e => setCurrentSession({ ...currentSession, start_time: new Date(e.target.value).toISOString() })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Status</label>
                                    <select
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                        value={currentSession.status || 'scheduled'}
                                        onChange={e => setCurrentSession({ ...currentSession, status: e.target.value as any })}
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="live">Live Now</option>
                                        <option value="ended">Ended</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Required Plan</label>
                                    <select
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                        value={currentSession.required_plan_id || ''}
                                        onChange={e => setCurrentSession({ ...currentSession, required_plan_id: e.target.value })}
                                    >
                                        <option value="">Public (Free)</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="purchasable"
                                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                                        checked={currentSession.is_purchasable || false}
                                        onChange={e => setCurrentSession({ ...currentSession, is_purchasable: e.target.checked })}
                                    />
                                    <label htmlFor="purchasable" className="text-sm font-bold text-zinc-300">Enable Lifetime Purchase</label>
                                </div>
                                {currentSession.is_purchasable && (
                                    <input
                                        type="number"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none"
                                        value={currentSession.price || ''}
                                        onChange={e => setCurrentSession({ ...currentSession, price: parseFloat(e.target.value) })}
                                        placeholder="Price (DA)"
                                    />
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSave}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Save size={18} /> Save Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
