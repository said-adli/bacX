import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Brain, BookOpen, ClipboardCheck } from "lucide-react";

/**
 * FEATURE DATA
 */
const features = [
  {
    id: "plan",
    icon: Brain,
    iconClass: "text-yellow-500",
    text: "Personalized Study Plans",
  },
  {
    id: "teachers",
    icon: BookOpen,
    iconClass: "text-blue-500",
    text: "Expert Teachers",
  },
  {
    id: "mock",
    icon: ClipboardCheck,
    iconClass: "text-green-500",
    text: "Mock Exams & Tracking",
  },
];

export default function BacXLanding() {
  return (
    <div
      dir="ltr"
      className="min-h-screen w-full bg-gradient-to-br from-white via-slate-50 to-blue-100 font-sans text-slate-900 flex flex-col"
    >
      {/* HEADER */}
      <header className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-10 flex-none">
        <h1 className="text-3xl font-black tracking-tighter">
          bac<span className="text-blue-600">X</span>
        </h1>
      </header>

      {/* MAIN HERO CONTENT */}
      {/* 
         min-h for vertical centering assurance on taller screens.
         grid-cols-1 for mobile, lg:grid-cols-2 for desktop split.
         gap-12 or gap-16 to prevent cramping.
      */}
      <main className="flex-grow flex items-center justify-center py-12 md:py-16 lg:py-20">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT COLUMN: Text & CTA */}
          <div className="flex flex-col space-y-8 md:space-y-10 order-2 lg:order-1 text-center lg:text-left">

            {/* HEADLINE */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
                Master Your BAC. <br className="hidden md:block" />
                <span className="text-slate-700/90">Secure Your Future.</span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-lg mx-auto lg:mx-0">
                Comprehensive preparation for the BAC exam.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full">
              <Link
                href="/auth?mode=login"
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
              >
                Login
              </Link>
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-300 to-blue-400 text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_10px_20px_rgba(147,197,253,0.3)] hover:brightness-110 active:scale-95 transition-all"
              >
                Sign Up
              </Link>
            </div>

            {/* FEATURES */}
            {/* 
               Mobile: Grid 2 cols or 1 col depending on strict constraints (here grid-cols-2 or 3 implies cramping). 
               Let's use a wrapping flex container for best fluid behavior or a responsive grid.
               User request: "grid on small screens, flex/wrap on larger" 
            */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-4 pt-4 md:pt-8 w-full">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.id}
                    className="
                      group
                      flex flex-col items-center justify-center text-center
                      p-4 rounded-2xl
                      backdrop-blur-md bg-white/60 border border-white/50
                      shadow-lg hover:shadow-xl hover:bg-white/80
                      transition-all duration-300
                      min-w-[100px] lg:w-32 xl:w-40
                    "
                  >
                    <Icon className={`w-8 h-8 mb-3 ${f.iconClass} group-hover:scale-110 transition-transform`} />
                    <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-600 leading-tight">
                      {f.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Hero Image */}
          {/* 
             Hidden on very small screens if needed, strictly requested "Right image should never take too much space". 
             Limit max-width.
          */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-md lg:max-w-xl aspect-[4/3] rotate-2 hover:rotate-0 transition-transform duration-500 ease-out">
              <div className="absolute inset-0 bg-blue-200/50 rounded-[2rem] blur-xl -z-10 transform scale-95 translate-y-4"></div>
              <div className="bg-white/30 backdrop-blur-sm p-4 rounded-[2rem] shadow-2xl border border-white ring-1 ring-white/50 h-full w-full">
                <div className="relative h-full w-full bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                  <Image
                    src="/hero-desk.jpg"
                    alt="BacX Study Setup"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
