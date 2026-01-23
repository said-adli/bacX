"use client";
import React from "react";

import { useRef, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
    color?: string;
    [key: string]: any;
}

const CrystalSubjectCardComponent = function CrystalSubjectCard({ subject }: { subject: Subject }) {
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
                className="glass-card relative h-64 overflow-hidden group hover:scale-[1.02] cursor-pointer"
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
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{subject.name}</h3>
                        <p className="text-sm text-white/40 line-clamp-2">{subject.description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export const CrystalSubjectCard = React.memo(CrystalSubjectCardComponent);
