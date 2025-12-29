import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Brain, BookOpen, ClipboardCheck } from "lucide-react";

const features = [
  { id: "plan", icon: Brain, iconClass: "text-yellow-500", text: "Personalized Study Plans" },
  { id: "teachers", icon: BookOpen, iconClass: "text-blue-500", text: "Expert Teachers" },
  { id: "mock", icon: ClipboardCheck, iconClass: "text-green-500", text: "Mock Exams & Tracking" },
];

export default function BacXLanding() {
  return (
    <div
      dir="ltr"
      className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-100 px-6 md:px-20 font-sans text-slate-900"
    >
      <header className="pt-10">
        <h1 className="text-3xl font-black">
          bac<span className="text-blue-600">X</span>
        </h1>
      </header>

      <main className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full py-14 md:py-20">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="block list-none text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Master Your BAC. <br />
              <span className="text-slate-800">Secure Your Future.</span>
            </h2>

            <p className="text-lg text-slate-500 font-medium">
              Comprehensive preparation for the BAC exam.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/auth?mode=login"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-500 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
            >
              Login
            </Link>

            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-300 to-blue-400 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-blue-100 hover:scale-105 transition-transform"
            >
              Sign Up
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 pt-6 md:pt-10">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.id}
                  className="
                    w-36 p-4 rounded-2xl shadow-xl flex flex-col items-center text-center
                    border border-white/30
                    bg-white/70 hover:bg-white/80
                    md:bg-white/40 md:hover:bg-white/60
                    supports-[backdrop-filter]:bg-white/40
                    supports-[backdrop-filter]:backdrop-blur-xl
                    transition-colors
                  "
                >
                  <Icon className={`mb-2 ${f.iconClass}`} />
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                    {f.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block relative">
          <div className="bg-white/50 p-4 rounded-[2rem] shadow-2xl rotate-2 border border-white">
            <div className="relative bg-slate-200 rounded-2xl aspect-[4/3] overflow-hidden">
              <Image src="/hero-desk.jpg" alt="Desk setup" fill className="object-cover" priority />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
