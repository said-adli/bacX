"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit, Trash2, X, Calendar, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface PlatformUpdate {
    id: string;
    title: string;
    description: string;
    type: 'feature' | 'improvement' | 'fix' | 'announcement';
    version: string;
    is_published: boolean;
    created_at: string;
}

export default function AdminPlatformUpdates() {
    const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUpdate, setCurrentUpdate] = useState<Partial<PlatformUpdate>>({});
    const [isSaving, setIsSaving] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchUpdates();
    }, [fetchUpdates]);

    const fetchUpdates = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('platform_updates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Failed to load updates");
            console.error(error);
        } else {
            setUpdates(data || []);
        }
        setIsLoading(false);
    }, [supabase]);

    const handleSave = async () => {
        if (!currentUpdate.title || !currentUpdate.description) {
            toast.error("Title and description are required");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                title: currentUpdate.title,
                description: currentUpdate.description,
                type: currentUpdate.type || 'improvement',
                version: currentUpdate.version || '1.0.0',
                is_published: currentUpdate.is_published ?? true,
                updated_at: new Date().toISOString()
            };

            if (currentUpdate.id) {
                const { error } = await supabase
                    .from('platform_updates')
                    .update(payload)
                    .eq('id', currentUpdate.id);
                if (error) throw error;
                toast.success("Update modified");
            } else {
                const { error } = await supabase
                    .from('platform_updates')
                    .insert([payload]);
                if (error) throw error;
                toast.success("New update published");
            }

            setIsEditing(false);
            setCurrentUpdate({});
            fetchUpdates();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save update");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this update?")) return;

        const { error } = await supabase
            .from('platform_updates')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("Failed to delete");
        } else {
            toast.success("Update deleted");
            fetchUpdates();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Platform Updates</h1>
                    <p className="text-zinc-400">Manage release notes and system announcements</p>
                </div>
                <Button
                    onClick={() => {
                        setCurrentUpdate({ type: 'feature', is_published: true });
                        setIsEditing(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                    <Plus size={18} className="mr-2" /> New Update
                </Button>
            </div>

            {/* Editor Modal / Overlay */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <GlassCard className="w-full max-w-2xl p-6 border-white/10 bg-[#0A0A15]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {currentUpdate.id ? "Edit Update" : "New Update"}
                            </h2>
                            <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Type</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                        value={currentUpdate.type}
                                        onChange={(e) => setCurrentUpdate({ ...currentUpdate, type: e.target.value as PlatformUpdate['type'] })}
                                    >
                                        <option value="feature">✨ Feature</option>
                                        <option value="improvement">🚀 Improvement</option>
                                        <option value="fix">🐛 Bug Fix</option>
                                        <option value="announcement">📢 Announcement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Version</label>
                                    <input
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                        placeholder="v1.0.0"
                                        value={currentUpdate.version || ''}
                                        onChange={(e) => setCurrentUpdate({ ...currentUpdate, version: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Title</label>
                                <input
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                    placeholder="What's new?"
                                    value={currentUpdate.title || ''}
                                    onChange={(e) => setCurrentUpdate({ ...currentUpdate, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Description</label>
                                <textarea
                                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none"
                                    placeholder="Details about this update..."
                                    value={currentUpdate.description || ''}
                                    onChange={(e) => setCurrentUpdate({ ...currentUpdate, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="publish"
                                    className="rounded border-white/20 bg-black/20 text-blue-600"
                                    checked={currentUpdate.is_published}
                                    onChange={(e) => setCurrentUpdate({ ...currentUpdate, is_published: e.target.checked })}
                                />
                                <label htmlFor="publish" className="text-sm text-zinc-300">Publish immediately</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white">
                                    {isSaving ? "Saving..." : "Save Update"}
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* List */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-zinc-500 text-center py-10">Loading updates...</div>
                ) : updates.length === 0 ? (
                    <div className="text-zinc-500 text-center py-10 border border-dashed border-white/10 rounded-2xl">
                        No updates found. Create your first one!
                    </div>
                ) : (
                    updates.map(update => (
                        <GlassCard key={update.id} className="p-6 flex items-start justify-between group hover:bg-white/5 transition-colors border-white/5">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-white/5
                                    ${update.type === 'feature' ? 'bg-purple-500/10 text-purple-400' :
                                        update.type === 'fix' ? 'bg-red-500/10 text-red-400' :
                                            update.type === 'announcement' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-blue-500/10 text-blue-400'
                                    }`}>
                                    {update.type === 'feature' ? <Sparkles size={20} /> :
                                        update.type === 'fix' ? <AlertCircle size={20} /> :
                                            update.type === 'announcement' ? <Calendar size={20} /> :
                                                <Sparkles size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-white">{update.title}</h3>
                                        <span className="text-xs font-mono text-zinc-500 border border-white/10 px-2 py-0.5 rounded-full">
                                            {update.version}
                                        </span>
                                        {!update.is_published && (
                                            <span className="text-xs font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">DRAFT</span>
                                        )}
                                    </div>
                                    <p className="text-zinc-400 text-sm whitespace-pre-wrap">{update.description}</p>
                                    <div className="mt-3 flex items-center gap-4 text-xs text-zinc-600">
                                        <span>{new Date(update.created_at).toLocaleDateString()}</span>
                                        <span className="capitalize">{update.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setCurrentUpdate(update);
                                        setIsEditing(true);
                                    }}
                                    className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(update.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
