import { Vazirmatn } from "next/font/google";
import { Brain, BookOpen, ClipboardCheck } from "lucide-react";
import Image from "next/image";

// Initialize the font
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-vazirmatn",
});

export default function Home() {
  return (
    <main
      className={`min-h-screen w-full bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans ${vazirmatn.variable}`}
    >
      <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center h-full">
        {/* LEFT SECTION: Content */}
        <div className="flex flex-col space-y-8 lg:space-y-12 z-10 order-2 lg:order-1">
          {/* Logo */}
          <div className="flex items-center space-x-1">
            <span className="text-3xl font-bold text-black tracking-tight">
              bac
            </span>
            <span className="text-3xl font-bold text-blue-600">X</span>
          </div>

          {/* Headline & Subhead */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Master Your BAC.
              <br />
              <span className="text-slate-900">Secure Your Future.</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-lg">
              Comprehensive preparation for the BAC exam.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button className="px-10 py-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full text-white font-semibold text-lg hover:brightness-105 transition-all active:scale-95 shadow-[0_10px_20px_rgba(59,130,246,0.3)]">
              Login
            </button>
            <button className="px-10 py-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full text-white font-semibold text-lg hover:brightness-105 transition-all active:scale-95 shadow-[0_10px_20px_rgba(59,130,246,0.3)]">
              Sign Up
            </button>
          </div>

          {/* Feature Cards */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-blue-500" />}
              title="Personalized"
              subtitle="Study Plans"
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-blue-500" />}
              title="Expert"
              subtitle="Teachers"
            />
            <FeatureCard
              icon={<ClipboardCheck className="w-8 h-8 text-blue-500" />}
              title="Mock Exams"
              subtitle="& Tracking"
            />
          </div>
        </div>

        {/* RIGHT SECTION: Hero Image */}
        <div className="relative w-full h-full flex items-center justify-center order-1 lg:order-2">
          {/* 
            Placeholder for the Desk Setup Image 
            In a real scenario, this would be an <Image /> component.
            For now, we simulate the "container anchored to the right with a clean shadow".
          */}
          <div className="relative w-full max-w-[800px] aspect-[4/3] lg:aspect-square flex items-center justify-center">
            {/* 
                We use a colorful placeholder div to represent the hero image area 
                Use a real image path here when available.
             */}
             <div className="w-full h-auto bg-transparent relative z-10 flex flex-col items-center justify-center p-8">
               {/* 
                 For the purpose of the exact recreation without the actual asset, 
                 I'm adding a container div that would hold the image.
                 The user asked for the container to be created and anchored.
               */}
               <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-slate-300">
                  <div className="text-center p-10">
                     <p>Hero Image Container</p>
                     <p className="text-sm opacity-60">(Replace with actual desk setup image)</p>
                  </div>
                  {/* To fulfill "NO PLACEHOLDERS" visual constraint as much as possible without the file, 
                      I will try to make this look elegant even without the image, 
                      or ideally, use a generic reliable unsplash URL if permitted, 
                      but since I must REBUILD the UI, I'll stick to a clean container structure.
                      However, the prompt allows "Act as a Senior Frontend Engineer... recreate the EXACT UI".
                      Since I don't have the image file content, I will provide the slot.
                  */}
               </div>
               
               {/* Decorative Gradient Blob behind the image to match the "glow" often seen in modern UIs */}
               <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-row items-center gap-4 px-6 py-4 rounded-2xl backdrop-blur-xl bg-white/40 border border-white/20 shadow-sm hover:bg-white/50 transition-colors w-full sm:w-auto">
      <div className="p-2 rounded-full bg-yellow-50/50 shadow-inner">
         {/* The screenshot shows a glowing yellow background behind icons approx */}
         {/* The user prompt says "Icons: Brain, Book, and Checklist". */}
          {icon}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-slate-900 font-bold leading-tight">{title}</span>
        <span className="text-slate-600 font-medium leading-tight text-sm">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
