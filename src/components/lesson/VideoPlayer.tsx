"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "../ui/GlassCard";
import { ShieldAlert } from "lucide-react";

interface EncodedVideoPlayerProps {
    encodedVideoId: string; // SALT + ID + SALT (Base64)
}

export default function EncodedVideoPlayer({ encodedVideoId }: EncodedVideoPlayerProps) {
    const [decodedId, setDecodedId] = useState<string | null>(null);
    const [securityWarning, setSecurityWarning] = useState(false);
    const { user } = useAuth();
    const [sessionIp] = useState("192.168.x.x");

    useEffect(() => {
        let mounted = true;

        async function fetchDecodedId() {
            try {
                // MOCK/DEV BYPASS: Check if it's a mock ID from our new library
                // Mock format: "enc_LESSONID_REALYOUTUBEID"
                if (encodedVideoId.startsWith("enc_")) {
                    const parts = encodedVideoId.split("_");
                    // parts[0] = "enc", parts[1] = lessonId, parts[2] = youtubeId
                    if (parts.length >= 3) {
                        if (mounted) setDecodedId(parts[2]);
                        return;
                    }
                }

                const res = await fetch('/api/video/decrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ encodedId: encodedVideoId })
                });

                if (!res.ok) throw new Error("Decryption failed");

                const data = await res.json();
                if (mounted && data.videoId) {
                    setDecodedId(data.videoId);
                } else {
                    setDecodedId("invalid_token");
                }
            } catch (e) {
                // DEVELOPMENT FALLBACK for demo purposes if API fails
                console.warn("Decryption API failed, using fallback for demo");
                // Fallback to a safe educational video if everything fails
                if (mounted) setDecodedId("M7lc1UVf-VE");
            }
        }

        fetchDecodedId();

        return () => { mounted = false; };
    }, [encodedVideoId]);

    // 2. Anti-Inspect Logic
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F12" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) || (e.ctrlKey && e.key === "U")) {
                e.preventDefault();
                setSecurityWarning(true);
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (securityWarning) {
        return (
            <GlassCard className="w-full aspect-video flex flex-col items-center justify-center bg-red-950/20 border-red-500/20 text-center p-8">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-white mb-2">تنبيه أمني</h3>
                <p className="text-zinc-400">تم اكتشاف محاولة اختراق.</p>
                <button onClick={() => setSecurityWarning(false)} className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">متابعة المشاهدة</button>
            </GlassCard>
        )
    }

    if (!decodedId) return <div className="w-full aspect-video bg-zinc-900 animate-pulse rounded-2xl" />;

    return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden group select-none">
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${decodedId}?rel=0&modestbranding=1&controls=1&showinfo=0&fs=1`}
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
            {/* Hardened Overlay: Blocks clicks on title/share/watch later */}
            <div className="absolute top-0 left-0 right-0 h-[15%] z-20" />

            {/* Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-30">
                <div className="absolute top-10 left-10 text-[10px] text-white/10 -rotate-12 whitespace-nowrap">{user?.email} • ID: {user?.id.substring(0, 8)}</div>
                <div className="absolute bottom-20 right-20 text-[10px] text-white/10 -rotate-12 whitespace-nowrap">{user?.email} • {sessionIp}</div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14px] font-bold text-white/5 -rotate-45 whitespace-nowrap">BRAINY • {user?.email}</div>
            </div>
        </div>
    );
}
