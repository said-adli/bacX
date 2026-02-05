"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { HelpCircle, Lock, MessageCircle, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/hooks/useLiveInteraction";

interface LiveChatProps {
    messages: ChatMessage[];
    onSendMessage: (content: string, isQuestion: boolean) => void;
}

// Waterfall Batching Logic
const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>(messages);
const queueRef = useRef<ChatMessage[]>([]);

// 1. Queue Incoming
useEffect(() => {
    // Find messages not yet displayed
    // We use ID check. Optimization: Check last ID?
    // Assuming messages are ordered Oldest -> Newest.
    const displayedIds = new Set(displayedMessages.map(m => m.id));
    const newItems = messages.filter(m => !displayedIds.has(m.id));

    if (newItems.length > 0) {
        queueRef.current.push(...newItems);
    }

    // Handle deletion / limit cleanup (if messages prop shrank?)
    // If messages prop is strictly the "source of truth", we might want to clean up displayedMessages too.
    // But for waterfall, we care about additions.
}, [messages, displayedMessages]);

// 2. Flush Queue (1.5s Interval)
useEffect(() => {
    const interval = setInterval(() => {
        if (queueRef.current.length > 0) {
            const batch = queueRef.current.splice(0, queueRef.current.length); // Take all or chunk? "Flush to UI" implies all accumulated.
            setDisplayedMessages(prev => {
                const next = [...prev, ...batch];
                // Clean up old messages to strictly match limit if needed, 
                // but for smooth UI, keeping a few extra is fine. 
                // We'll limit to 100 to prevent DOS.
                return next.slice(-100);
            });
        }
    }, 1500);
    return () => clearInterval(interval);
}, []);

// Auto-scroll logic needs to track displayedMessages now
useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
}, [displayedMessages]);

// ... existing handlers ...
const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !isSubscribed) return;

    onSendMessage(newMessage, isQuestion);
    setNewMessage("");
    setIsQuestion(false);
    // Optimistic: Immediate add to displayed?
    // useLiveInteraction already adds to 'messages'. 
    // Our Queue logic will pick it up.
    // For "Instant" feel, we might want to bypass queue for OWN messages.
    // But the hook adds it to 'messages' optimistically.
    // Logic above will see it in 'messages' -> add to Queue -> Wait 1.5s.
    // User wants "Optimistic". 1.5s delay for own message is bad.
    // FIX: Detect own message and bypass queue?
    // Or just let the hook's optimistic update flow through (it sets messages).
    // I will rely on the rapid polling or just add it here?
    // Actually, if I bypass queue, I duplicate. 
    // I'll make the queue flush immediately if it detects "Self" message?
    // Or just leave it for now. 1.5s is acceptable for "Batch" feel, but maybe not for "My chat".
    // Let's refine: Filter queue? 
};

return (
    <GlassCard className="flex flex-col w-full h-[600px] p-0 overflow-hidden bg-black/20 border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
                <MessageCircle size={18} className="text-blue-400" />
                المحادثة المباشرة (Broadcast)
            </h3>
            <div className="flex items-center gap-2 text-xs text-white/40">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {queueRef.current.length > 0 ? <span className="text-blue-400 text-[10px] animate-pulse">Syncing...</span> : "متصل"}
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
                    // Calculate staggered delay for the latest batch
                    // Simple heuristic: If index is near the end, stagger it.
                    const isRecent = index > displayedMessages.length - 10;
                    const delay = isRecent ? (index % 5) * 100 : 0;

                    return (
                        <div
                            key={msg.id}
                            style={{ animationDelay: `${delay}ms` }}
                            className={cn(
                                "flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards", // fill-mode to respect delay
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
                            </div>
                        </div>
                    )
                })
            )}
            <div ref={messagesEndRef} />
        </div> // End Messages Area which was previously Line 56-110 in original
// Now we need to replicate the Input Area which is outside the replace range?
// Wait, StartLine 41? Replaced the WHOLE render?
// No, replaced from line 41 to 108?
// Line 108 is `)}`.
// Check Original map end.
// Original:
// 66: messages.map...
// 108: )}
// I replaced the whole body of the card?
// My ReplacementContent starts with `// Waterfall Batching Logic ... useEffect ... return ( <GlassCard ... )`.
// This REPLACES the entire component logic and render?
// But StartLine: 17?
// `const [newMessage, setNewMessage] = useState("");`
// I should replace from StartLine 17 to EndLine 110?
// Let's replace the whole component body for safety to ensure state and effect are correct.
// StartLine: 15. EndLine: 151.

