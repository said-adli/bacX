import Link from "next/link";
import Image from "next/image";
import { VerifyOtpForm } from "./VerifyOtpForm";

export const metadata = {
  title: "التحقق من الحساب",
};


export default async function VerifyOtpPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Determine email and type from search parameters
    const email = (searchParams.email as string) || "";
    const type = (searchParams.type as "signup" | "recovery") || "signup";

    return (
        <div className="min-h-screen flex w-full bg-[#0a0f1c]">
            {/* Left Side (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-[#0a0f1c]">
                {/* Glowing Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>

                <div className="relative z-10 text-center px-8 sm:px-12">
                    <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                        مرحباً بك في منصتنا التعليمية
                    </h1>
                    <p className="text-lg text-blue-100/80 max-w-lg mx-auto leading-relaxed">
                        نقدم لك أفضل تجربة تعليمية مع أحدث التقنيات وأفضل الخبراء في مختلف المجالات.
                    </p>
                </div>
            </div>

            {/* Right Side (Form Area) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md glass-card shadow-2xl p-8 sm:p-10">
                    <Link href="/">
                        <div className="flex justify-center mb-8">
                            <Image
                                src="/images/logo.png"
                                alt="Brainy"
                                width={180}
                                height={56}
                                className="h-14 w-auto object-contain drop-shadow-md"
                                priority
                            />
                        </div>
                    </Link>

                    <VerifyOtpForm email={email} type={type} />
                </div>
            </div>
        </div>
    );
}

