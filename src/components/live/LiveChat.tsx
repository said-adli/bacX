"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { HelpCircle, Lock, MessageCircle, Send, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    user_id: string;
    user_name: string;
    content: string;
    role: 'student' | 'teacher' | 'admin';
    is_question: boolean;
    created_at: string;
}

export function LiveChat() {
    const { user, profile } = useAuth();
    const supabase = createClient();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isQuestion, setIsQuestion] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const isSubscribed = profile?.is_subscribed === true;
    const isAdmin = profile?.role === 'admin';

    // 1. Subscribe to Realtime Messages
    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('live_messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(100);
            if (data) setMessages(data as Message[]);
        };

        fetchMessages();

        const channel = supabase
            .channel('live_messages_chat')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'live_messages'
            }, (payload: any) => {
                const newMsg = payload.new as Message;
                setMessages(prev => [...prev, newMsg]);
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'live_messages'
            }, (payload: any) => {
                setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    // 2. Auto-scroll on new message
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !isSubscribed) return;

        const { error } = await supabase.from('live_messages').insert({
            user_id: user.id,
            user_name: profile?.full_name || user.email?.split('@')[0] || 'Anonymous',
            content: newMessage,
            role: isAdmin ? 'teacher' : 'student',
            is_question: isQuestion
        });

        if (error) {
            console.error("Error sending message:", error);
            alert("فشل إرسال الرسالة");
        } else {
            setNewMessage("");
            setIsQuestion(false);
        }
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!isAdmin) return;
        await supabase.from('live_messages').delete().eq('id', msgId);
    };

    return (
        <GlassCard className="flex flex-col w-full h-[600px] p-0 overflow-hidden bg-black/20 border-white/10 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <MessageCircle size={18} className="text-blue-400" />
                    المحادثة المباشرة
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    متصل
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar scroll-smooth"
            >
                {!isSubscribed ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-white/30 text-sm">
                        <Lock size={32} className="mb-4 opacity-50" />
                        <p>المحادثة متاحة للمشتركين فقط</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === 'teacher' ? "flex-row-reverse" : ""
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold",
                                msg.role === 'teacher' ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]" : "bg-white/10 text-white/60"
                            )}>
                                {msg.role === 'teacher' ? "T" : msg.user_name.charAt(0).toUpperCase()}
                            </div>

                            {/* Bucket */}
                            <div className={cn(
                                "relative max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                                msg.role === 'teacher'
                                    ? "bg-blue-600/20 border border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    : "bg-white/5 border border-white/5 text-white/90",
                                msg.is_question && msg.role !== 'teacher'
                                    ? "border-yellow-500/30 bg-yellow-900/10 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                                    : ""
                            )}>
                                {/* Name */}
                                <div className={cn(
                                    "flex items-center gap-2 mb-1 text-[10px] uppercase tracking-wider font-bold",
                                    msg.role === 'teacher' ? "text-blue-300 justify-end" : "text-white/40",
                                    msg.is_question && msg.role !== 'teacher' ? "text-yellow-500" : ""
                                )}>
                                    {msg.user_name}
                                    {msg.role === 'teacher' && <span className="bg-blue-500 text-white px-1 rounded-[2px] text-[8px]">TEACHER</span>}
                                    {msg.is_question && <HelpCircle size={10} className="text-yellow-500 animate-pulse" />}
                                </div>

                                {/* Content */}
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                {/* Admin Actions */}
                                {isAdmin && (
                                    <button
                                        onClick={() => handleDeleteMessage(msg.id)}
                                        className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-500/0 group-hover:text-red-500/50 hover:!text-red-500 transition-all p-1"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {isSubscribed && (
                <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-md">
                    <form onSubmit={handleSendMessage} className="relative flex gap-2">
                        {/* Question Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsQuestion(!isQuestion)}
                            className={cn(
                                "p-3 rounded-xl transition-all border",
                                isQuestion
                                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                            )}
                            title="طرح سؤال"
                        >
                            <HelpCircle size={20} />
                        </button>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isQuestion ? "اكتب سؤالك هنا..." : "اكتب رسالة..."}
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                        />

                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/40"
                        >
                            <Send size={18} className={newMessage.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                        </button>
                    </form>
                </div>
            )}
        </GlassCard>
    );
}
