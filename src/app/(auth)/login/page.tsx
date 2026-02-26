import LoginClient from "./LoginClient";
import { ShieldCheck, User, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
    title: "تسجيل الدخول",
    description: "سجل دخولك إلى منصة BRAINY",
};

export default function LoginPage() {
    return (
        <div className="w-full max-w-md glass-card p-8 sm:p-10 shadow-2xl">
            <Link href="/">
                <div className="flex justify-center mb-8">
                    <Image
                        src="/images/logo.png"
                        alt="Brainy Logo"
                        width={180}
                        height={56}
                        className="h-14 w-auto object-contain drop-shadow-md"
                        priority
                    />
                </div>
            </Link>
            <LoginClient />
        </div>
    );
}
