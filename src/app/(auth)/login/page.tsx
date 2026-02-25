import LoginClient from "./LoginClient";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "تسجيل الدخول | Brainy",
    description: "سجل دخولك إلى منصة BRAINY",
};

export default function LoginPage() {
    return (
        <div className="w-full max-w-md glass-card p-8 sm:p-10 shadow-2xl">
            <Link href="/">
                <img src="/images/logo.png" alt="Brainy Logo" className="h-14 w-auto mx-auto mb-8 object-contain drop-shadow-md" />
            </Link>
            <LoginClient />
        </div>
    );
}
