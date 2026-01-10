"use client";

import { useRef, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Subject } from "@/data/mockLibrary";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CrystalSubjectCard({ subject }: { subject: Subject }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <Link href={`/materials/${subject.id}`}>
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative h-64 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] cursor-pointer"
            >
                {/* Interactive Glow */}
                <div
                    className="absolute pointer-events-none transition-opacity duration-500"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`
                    }}
                />

                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                        <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{subject.icon}</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{subject.name}</h3>
                        <p className="text-sm text-white/40 line-clamp-2">{subject.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-white/30 pt-4 border-t border-white/5">
                        <span>{subject.unitCount} وحدات</span>
                        <span>•</span>
                        <span>{subject.lessonCount} درس</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
