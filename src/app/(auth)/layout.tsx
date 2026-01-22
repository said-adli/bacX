export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white flex items-center justify-center font-tajawal">
            {/* Deep Space Background with Galaxy Glow */}
            <div className="absolute inset-0 z-0">
                {/* Photorealistic Earth/Planet suggestion - keeping abstract for now per request for 'Galaxy Glow' */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/10 blur-[150px] rounded-full opacity-40 mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-900/10 blur-[150px] rounded-full opacity-40 mix-blend-screen animate-pulse-slow delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md lg:max-w-full lg:p-0">
                {children}
            </div>
        </div>
    );
}
