"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertCircle, HelpCircle, Lock, Loader2, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/hooks/useLiveInteraction";

interface LiveChatProps {
    messages: ChatMessage[];
    onSendMessage: (content: string, isQuestion: boolean) => void;
}

export default function LiveChat({ messages, onSendMessage }: LiveChatProps) {
    const { user, profile } = useAuth();
    const isSubscribed = profile?.is_subscribed ?? false;

    // Local State
    const [newMessage, setNewMessage] = useState("");
    const [isQuestion, setIsQuestion] = useState(false);

    // Waterfall Batching: Queue incoming messages for staggered display
    const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>(messages);
    const queueRef = useRef<ChatMessage[]>([]);

    // Refs
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Queue Incoming Messages
    useEffect(() => {
        const displayedIds = new Set(displayedMessages.map(m => m.id));
        const newItems = messages.filter(m => !displayedIds.has(m.id));

        if (newItems.length > 0) {
            queueRef.current.push(...newItems);
        }
    }, [messages, displayedMessages]);

    // 2. Flush Queue (1.5s Interval for waterfall effect)
    useEffect(() => {
        const interval = setInterval(() => {
            if (queueRef.current.length > 0) {
                const batch = queueRef.current.splice(0, queueRef.current.length);
                setDisplayedMessages(prev => {
                    const next = [...prev, ...batch];
                    // Limit to 100 messages to prevent memory issues
                    return next.slice(-100);
                });
            }
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    // 3. Auto-scroll on new messages
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [displayedMessages]);

    // Submit Handler
    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !isSubscribed) return;

        onSendMessage(newMessage, isQuestion);
        setNewMessage("");
        setIsQuestion(false);
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
                    displayedMessages.map((msg, index) => {
                        // Staggered animation for recent messages
                        const isRecent = index > displayedMessages.length - 10;
                        const delay = isRecent ? (index % 5) * 100 : 0;

                        return (
                            <div
                                key={msg.id}
                                style={{ animationDelay: `${delay}ms` }}
                                className={cn(
                                    "flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards",
                                    msg.role === 'teacher' && "flex-row-reverse",
                                    msg.status === 'pending' && "opacity-60",
                                    msg.status === 'failed' && "opacity-40"
                                )}
                            >
                                {/* Avatar */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold",
                                    msg.role === 'teacher'
                                        ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                                        : "bg-white/10 text-white/60"
                                )}>
                                    {msg.role === 'teacher' ? "T" : msg.user_name.charAt(0).toUpperCase()}
                                </div>

                                {/* Bubble */}
                                <div className={cn(
                                    "relative max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                                    msg.role === 'teacher'
                                        ? "bg-blue-600/20 border border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                        : "bg-white/5 border border-white/5 text-white/90",
                                    msg.is_question && msg.role !== 'teacher'
                                        ? "border-yellow-500/30 bg-yellow-900/10 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                                        : ""
                                )}>
                                    {/* Name + Status */}
                                    <div className={cn(
                                        "flex items-center gap-2 mb-1 text-[10px] uppercase tracking-wider font-bold",
                                        msg.role === 'teacher' ? "text-blue-300 justify-end" : "text-white/40",
                                        msg.is_question && msg.role !== 'teacher' && "text-yellow-500"
                                    )}>
                                        {msg.user_name}
                                        {msg.role === 'teacher' && (
                                            <span className="bg-blue-500 text-white px-1 rounded-[2px] text-[8px]">TEACHER</span>
                                        )}
                                        {msg.is_question && <HelpCircle size={10} className="text-yellow-500 animate-pulse" />}
                                        {/* Status indicators */}
                                        {msg.status === 'pending' && <Loader2 size={10} className="animate-spin text-white/40" />}
                                        {msg.status === 'failed' && <AlertCircle size={10} className="text-red-400" />}
                                    </div>

                                    {/* Content */}
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                    {/* Failed retry hint */}
                                    {msg.status === 'failed' && (
                                        <p className="text-red-400 text-[10px] mt-1">فشل الإرسال</p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={submitHandler} className="p-4 border-t border-white/5 bg-white/5">
                {!user ? (
                    <p className="text-center text-white/30 text-sm">سجّل الدخول للمشاركة</p>
                ) : !isSubscribed ? (
                    <p className="text-center text-white/30 text-sm">اشترك للمشاركة في المحادثة</p>
                ) : (
                    <div className="flex gap-2 items-center">
                        {/* Question Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsQuestion(!isQuestion)}
                            className={cn(
                                "p-2 rounded-lg transition-all shrink-0",
                                isQuestion
                                    ? "bg-yellow-500/20 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                                    : "bg-white/5 text-white/30 hover:bg-white/10"
                            )}
                            title="تحديد كسؤال"
                        >
                            <HelpCircle size={18} />
                        </button>

                        {/* Input */}
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="اكتب رسالتك..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
                            maxLength={500}
                        />

                        {/* Send */}
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className={cn(
                                "p-2 rounded-lg transition-all shrink-0",
                                newMessage.trim()
                                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                                    : "bg-white/5 text-white/30 cursor-not-allowed"
                            )}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                )}
            </form>
        </GlassCard>
    );
}
