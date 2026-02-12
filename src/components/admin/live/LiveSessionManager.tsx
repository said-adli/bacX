import { useState, useEffect } from "react";
import { getLiveSessions, createLiveSession, updateLiveSession, deleteLiveSession, LiveSession, NewLiveSessionPayload } from "@/actions/admin-live";
import { SubscriptionPlan, getAdminPlans } from "@/actions/admin-plans";
import { getContentTree } from "@/actions/admin-content";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Video, Calendar, DollarSign, Lock, PlayCircle, ExternalLink, X, Save, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";

export default function LiveSessionManager({ onJoinSession }: { onJoinSession?: (session: LiveSession) => void }) {
    const [sessions, setSessions] = useState<(LiveSession & { subscription_plans?: { name: string } })[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [lessons, setLessons] = useState<{ id: string, title: string, subjectName: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // UI State uses standardized naming
    const [currentSession, setCurrentSession] = useState<Partial<NewLiveSessionPayload> & { id?: string }>({});

    const loadData = async () => {
        setIsLoading(true);
        const [sParams, pParams, treeParams] = await Promise.all([getLiveSessions(), getAdminPlans(), getContentTree()]);
        setSessions(sParams);
        setPlans(pParams);

        // Flatten lessons for easier selection
        const flatLessons: { id: string, title: string, subjectName: string }[] = [];
        treeParams.forEach(s => {
            s.units?.forEach(u => {
                u.lessons?.forEach(l => {
                    flatLessons.push({ id: l.id, title: l.title, subjectName: s.name });
                });
            });
        });
        setLessons(flatLessons);

        setIsLoading(false);
    };

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            if (isMounted) await loadData();
        };
        init();
        return () => { isMounted = false; };
    }, []);

    const handleSave = async () => {
        if (!currentSession.title || !currentSession.stream_url || !currentSession.scheduled_at) {
            toast.error("Please fill required fields (Title, Stream URL, Schedule)");
            return;
        }

        try {
            const payload: NewLiveSessionPayload = {
                title: currentSession.title,
                stream_url: currentSession.stream_url,
                scheduled_at: currentSession.scheduled_at,
                status: currentSession.status || 'scheduled',
                required_plan_id: currentSession.required_plan_id || null,
                is_purchasable: currentSession.is_purchasable || false,
                price: currentSession.price || null,
                is_active: currentSession.is_active ?? true,
                lesson_id: currentSession.lesson_id || null
            };

            if (currentSession.id) {
                await updateLiveSession(currentSession.id, payload);
                toast.success("Updated");
            } else {
                await createLiveSession(payload);
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

    const openEditor = (session?: Partial<LiveSession>) => {
        if (session) {
            // Map DB fields back to UI fields if editing
            setCurrentSession({
                id: session.id,
                title: session.title,
                stream_url: session.youtube_id, // MAP BACK
                scheduled_at: session.started_at, // MAP BACK
                status: session.status,
                required_plan_id: session.required_plan_id,
                is_purchasable: session.is_purchasable,
                price: session.price,
                is_active: session.is_active,
                lesson_id: session.lesson_id
            });
        } else {
            setCurrentSession({
                status: 'scheduled',
                is_active: true,
                is_purchasable: false,
                scheduled_at: new Date().toISOString().slice(0, 16) // Default to now-ish format for datetime-local
            });
        }
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
                                        {format(new Date(s.started_at), 'MMM d, yyyy HH:mm')}
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
                                title="Open Stream"
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

                        </div>

                        {/* Linked Lesson */}
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Linked Lesson (Required)</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 text-zinc-500" size={18} />
                                <select
                                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none appearance-none"
                                    value={currentSession.lesson_id || ''}
                                    onChange={e => setCurrentSession({ ...currentSession, lesson_id: e.target.value })}
                                >
                                    <option value="">Select a Lesson...</option>
                                    {lessons.map(l => (
                                        <option key={l.id} value={l.id}>{l.subjectName} - {l.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Stream URL / ID</label>
                                <input
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-mono"
                                    value={currentSession.stream_url || ''}
                                    onChange={e => setCurrentSession({ ...currentSession, stream_url: e.target.value })}
                                    placeholder="YouTube ID or URL"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Scheduled At</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    value={currentSession.scheduled_at?.slice(0, 16) || ''}
                                    onChange={e => setCurrentSession({ ...currentSession, scheduled_at: new Date(e.target.value).toISOString() })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Status</label>
                                <select
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    value={currentSession.status || 'scheduled'}
                                    onChange={e => setCurrentSession({ ...currentSession, status: e.target.value as 'scheduled' | 'live' | 'ended' })}
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
            )}
        </div>
    );
}
