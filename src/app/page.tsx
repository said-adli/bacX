"use client";

import Link from "next/link";
import Image from "next/image";
import { Brain, BookOpen, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden font-vazirmatn text-slate-900 flex flex-col lg:flex-row">

      {/* LEFT COLUMN: Content (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-12 lg:py-0 relative z-10 shrink-0">

        {/* Logo (Top Left) */}
        <div className="absolute top-8 left-8 sm:left-12 lg:top-10 lg:left-16 xl:left-24">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            bac<span className="text-blue-600">X</span>
          </h1>
        </div>

        {/* Hero Content Wrapper */}
        <div className="mt-20 lg:mt-0 space-y-10 max-w-xl">

          {/* Text */}
          <div className="space-y-4">
            <h2 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Master Your BAC. <br />
              <span className="text-slate-800">Secure Your Future.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Comprehensive preparation for the BAC exam.
            </p>
          </div>

          {/* Actions Row (Two Blue Gradient Buttons) */}
          <div className="flex flex-row gap-5">
            <Link href="/auth">
              <Button className="h-12 px-8 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white shadow-lg shadow-blue-500/30 border-0">
                Login
              </Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button className="h-12 px-8 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white shadow-lg shadow-blue-500/30 border-0">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Features Row (Glassmorphism Cards) */}
          <div className="flex flex-row gap-4 pt-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none">
            {/* Card 1 */}
            <div className="min-w-[140px] p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/60 shadow-sm flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-blue-600">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">Personalized <br /> Study Plans</span>
            </div>

            {/* Card 2 */}
            <div className="min-w-[140px] p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/60 shadow-sm flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">Expert <br /> Teachers</span>
            </div>

            {/* Card 3 */}
            <div className="min-w-[140px] p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/60 shadow-sm flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-blue-600">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">Mock Exams <br /> & Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Hero Image (50%) */}
      <div className="w-full lg:w-1/2 relative h-[50vh] lg:h-screen flex items-center justify-center lg:justify-end overflow-hidden">
        {/* The image is anchored to the right, blending in */}
        <div className="relative w-[120%] lg:w-[110%] h-[90%] lg:h-auto aspect-square lg:translate-x-10">
          <Image
            src="/images/hero-desk.png"
            alt="BacX Study Environment"
            fill
            className="object-contain lg:object-cover object-center lg:object-left"
            priority
          />
        </div>
      </div>

    </main>
  );
}
