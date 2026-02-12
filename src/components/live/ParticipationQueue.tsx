"use client";

import { LiveInteraction } from "@/hooks/useLiveInteraction";
import { Check, Mic, PhoneOff, User, Volume2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ParticipationQueueProps {
    queue: LiveInteraction[];
    currentSpeaker: LiveInteraction | null;
    onAccept: (interaction: LiveInteraction) => void;
    onEndCall: () => void;
    onLowerAll: () => void;
}

export function ParticipationQueue({ queue, currentSpeaker, onAccept, onEndCall, onLowerAll }: ParticipationQueueProps) {
    const { profile } = useAuth();
    const waitingList = queue.filter(q => q.status === 'waiting');
    const isAdmin = profile?.role === 'admin';

    return (
        <div className="space-y-6">
            {/* CURRENTLY SPEAKING */}
            <div className="glass-card p-6 border-blue-500/20 bg-blue-900/10">
                <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <Mic size={16} className="animate-pulse" />
                    المتحدث الحالي
                </h3>

                {currentSpeaker ? (
                    <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-blue-500/30">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 relative">
                                <User size={24} />
                                <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">{currentSpeaker.user_name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                        <Volume2 size={12} />
                                        متصل صوتياً
                                    </span>
                                    <span className="text-xs text-white/40">{new Date(currentSpeaker.created_at).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onEndCall}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 p-3 rounded-full transition-colors"
                            title="إنهاء المكالمة"
                        >
                            <PhoneOff size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                        لا يوجد متحدث حالياً
                    </div>
                )}
            </div>

            {/* WAITING LIST */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white/60 flex items-center gap-2">
                        <span>قائمة الانتظار</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">{waitingList.length}</span>
                    </h3>

                    {/* Teacher Action: Lower All Hands */}
                    {isAdmin && waitingList.length > 0 && (
                        <button
                            onClick={onLowerAll}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                        >
                            <XCircle size={12} />
                            إنزال الأيادي
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {waitingList.length === 0 && (
                        <p className="text-center text-white/20 text-sm py-4">لا يوجد طلاب في الانتظار</p>
                    )}

                    {waitingList.map((student) => (
                        <div key={student.id} className="group relative flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-lg transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                                    <User size={14} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white">{student.user_name}</h4>
                                    <span className="text-[10px] text-white/40 block">{new Date(student.created_at).toLocaleTimeString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => onAccept(student)}
                                className="bg-green-500/20 hover:bg-green-500 hover:text-white text-green-400 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                            >
                                <Check size={16} />
                                <span className="sr-only">قبول</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
