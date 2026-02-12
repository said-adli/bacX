"use client";


import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PlanetHero() {
    return (
        <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">

            {/* 3D Planet Visual */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Atmosphere Glow */}
                <div className="absolute w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse gpu-accelerated" />

                {/* The Planet */}
                <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(37,99,235,0.5)] animate-[float_10s_ease-in-out_infinite] gpu-accelerated">
                    {/* Texture / Gradient Map */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#3b82f6,transparent_60%),radial-gradient(circle_at_70%_70%,#1e3a8a,transparent_60%)] opacity-80" />
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0)_40%,rgba(255,255,255,0.1)_50%,rgba(0,0,0,0)_60%)] animate-[spin_20s_linear_infinite] gpu-accelerated" />
                </div>

                {/* Orbit Rings */}
                <div className="absolute w-[500px] h-[500px] border border-white/5 rounded-full rotate-x-[75deg] animate-[spin_30s_linear_infinite] gpu-accelerated" />
                <div className="absolute w-[700px] h-[700px] border border-white/5 rounded-full rotate-x-[75deg] -rotate-y-12 animate-[spin_40s_linear_infinite_reverse] gpu-accelerated" />
            </div>

            {/* Floating Content */}
            <div className="relative z-10 text-center space-y-8 mt-32">
                <h1 className="text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-900/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    BRAINY V4.0
                </h1>

                <p className="text-xl md:text-2xl text-blue-200/60 font-light tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                    اكتشف بُعداً جديداً للتعلم
                </p>

                <div className="animate-in fade-in zoom-in duration-1000 delay-700">
                    <Link
                        href="/materials"
                        className="group relative inline-flex items-center gap-4 px-12 py-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xl font-bold text-white overflow-hidden transition-all hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(37,99,235,0.4)]"
                    >
                        <span>أدخل المجرة</span>
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300 text-blue-400" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
