"use client";
import React from "react";

import { useRef, useState } from "react";


import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
    color?: string;
    lessons?: { id: string; title: string }[];
}

const getSubjectConfig = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes('رياضيات') || normalized.includes('math')) {
        return { icon: Calculator, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'group-hover:border-blue-500/30' };
    }
    if (normalized.includes('فيزياء') || normalized.includes('physics')) {
        return { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'group-hover:border-yellow-500/30' };
    }
    if (normalized.includes('علوم') || normalized.includes('science')) {
        return { icon: Microscope, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'group-hover:border-emerald-500/30' };
    }
    if (normalized.includes('أدب') || normalized.includes('literature') || normalized.includes('عربية')) {
        return { icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'group-hover:border-purple-500/30' };
    }
    if (normalized.includes('فلسفة') || normalized.includes('philosophy')) {
        return { icon: Feather, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'group-hover:border-pink-500/30' };
    }
    if (normalized.includes('انجليزية') || normalized.includes('english')) {
        return { icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'group-hover:border-indigo-500/30' };
    }
    // Default
    return { icon: LayoutGrid, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'group-hover:border-slate-500/30' };
};

import { Calculator, Zap, Microscope, BookOpen, Feather, Globe, LayoutGrid } from "lucide-react";

const CrystalSubjectCardComponent = function CrystalSubjectCard({ subject }: { subject: Subject }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const config = getSubjectConfig(subject.name);
    const Icon = config.icon;

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
                className={`glass-card relative h-48 overflow-hidden group hover:scale-[1.02] cursor-pointer transition-all duration-300 border border-white/5 ${config.border}`}
            >
                {/* Interactive Glow */}
                <div
                    className="absolute pointer-events-none transition-opacity duration-500"
                    style={{
                        opacity,
                        background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.03), transparent 40%)`
                    }}
                />

                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                        {/* Icon Container */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                            <Icon size={28} strokeWidth={1.5} />
                        </div>

                        {/* Arrow */}
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-white/10 group-hover:text-white transition-colors">
                            <ArrowLeft size={16} strokeWidth={1.5} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">{subject.name}</h3>
                        <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">{subject.description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export const CrystalSubjectCard = React.memo(CrystalSubjectCardComponent);
