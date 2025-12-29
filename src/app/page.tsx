"use client";

import Link from "next/link";
import Image from "next/image";
import { Brain, BookOpen, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-50/30 overflow-hidden font-vazirmatn text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex items-center relative">

      {/* Global Background Elements (Subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-blue-100/40 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute top-[20%] right-[0%] w-[50%] h-[80%] bg-indigo-50/60 blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 h-screen relative z-10">

        {/* LEFT SIDE: Content */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24 py-12 lg:py-0 relative">

          {/* Header / Logo (Absolute top-left within the container or fixed) */}
          <div className="absolute top-10 left-8 sm:left-12 lg:left-20 xl:left-24 flex items-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              bac<span className="text-blue-600">X</span>
            </h1>
          </div>

          <div className="space-y-10 max-w-xl animate-in fade-in slide-in-from-left-4 duration-1000">
            {/* Headlines */}
            <div className="space-y-6">
              <h2 className="text-5xl sm:text-6xl lg:text-[4rem] font-bold text-slate-900 leading-[1.1] tracking-tight">
                Master Your BAC. <br />
                <span className="text-slate-800/90">Secure Your Future.</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md">
                Comprehensive preparation for the BAC exam.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-row gap-4 items-center">
              <Link href="/auth">
                <Button className="h-14 px-10 rounded-full text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white shadow-[0_4px_20px_-4px_rgba(59,130,246,0.5)] transition-transform hover:scale-105 active:scale-95 border-0">
                  Login
                </Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button className="h-14 px-10 rounded-full text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white shadow-[0_4px_20px_-4px_rgba(59,130,246,0.5)] transition-transform hover:scale-105 active:scale-95 border-0">
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Feature Cards (Glassmorphism) */}
            <div className="flex flex-row gap-4 pt-4 sm:pt-8 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none mask-image-b">
              {/* Card 1 */}
              <div className="min-w-[140px] px-6 py-5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center gap-4 hover:bg-white/60 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100/50 flex items-center justify-center text-blue-600">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-700 leading-snug">Personalized <br /> Study Plans</span>
              </div>

              {/* Card 2 */}
              <div className="min-w-[140px] px-6 py-5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center gap-4 hover:bg-white/60 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-blue-100/50 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-700 leading-snug">Expert <br /> Teachers</span>
              </div>

              {/* Card 3 */}
              <div className="min-w-[140px] px-6 py-5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center gap-4 hover:bg-white/60 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100/50 flex items-center justify-center text-blue-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-700 leading-snug">Mock Exams <br /> & Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Hero Image (Contextual Background) */}
        <div className="hidden lg:flex items-center justify-center relative translate-x-12 translate-y-12 xl:translate-x-0 xl:translate-y-0">
          <div className="relative w-full max-w-[900px] aspect-[1.1] animate-in fade-in zoom-in-95 duration-1000">
            <Image
              src="/images/hero-desk.png"
              alt="BacX Workspace"
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

      </div>
    </main>
  );
}
