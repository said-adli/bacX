import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft } from "lucide-react";

export function AuthLayoutShell({ children, title }: { children: React.ReactNode; title: string }) {
    return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col md:flex-row overflow-hidden">
            {/* Left Side (Art) - Static */}
            <div className="hidden md:flex flex-1 relative items-center justify-center bg-black overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

                {/* Static Art/Gradient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[10px] translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[10px] -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 p-12 text-center">
                    <Logo className="h-24 mx-auto mb-8 invert brightness-0" />
                    <h1 className="text-4xl font-bold text-white mb-4">Master Your Future</h1>
                    <p className="text-zinc-400 text-lg max-w-sm mx-auto">
                        Join thousands of students achieving excellence with BrainyDZ.
                    </p>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative animate-in fade-in duration-500">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-sm text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
                            <ArrowLeft size={16} /> Back
                        </Link>
                        <div className="text-right">
                            {/* Toggle Link - Prefetching Enabled by Default */}
                            {title === "Login" ? (
                                <Link href="/auth/signup" className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">
                                    Create Account
                                </Link>
                            ) : (
                                <Link href="/login" className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
                        <p className="text-zinc-500 mt-2">Welcome back to your workspace.</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
