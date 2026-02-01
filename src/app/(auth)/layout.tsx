import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white font-tajawal relative overflow-hidden">
            {/* Grid Pattern Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />

            {/* Spotlight Effect at Top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

            {/* Secondary Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-radial from-indigo-600/8 to-transparent rounded-full blur-[100px] pointer-events-none" />

            {/* Logo Section - Fixed at Top */}
            <div className="relative z-20 mb-8 mt-12 flex flex-col items-center animate-fade-in">
                <div className="relative mb-4">
                    <Logo className="w-20 h-20 text-white brightness-0 invert" />
                </div>
                <span className="text-4xl font-bold tracking-tight text-white/90">Brainy</span>
            </div>

            {/* Glass Card Container */}
            <div className="relative z-10 w-full max-w-md px-4">
                <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
                    {/* Inner Shine */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </div>

            {/* Card ground shadow */}
            <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[350px] h-[20px] bg-black/30 blur-[25px] rounded-full pointer-events-none" />
        </div>
    );
}
