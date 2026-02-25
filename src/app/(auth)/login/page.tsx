import LoginClient from "./LoginClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "تسجيل الدخول | Brainy",
    description: "سجل دخولك إلى منصة BRAINY",
};

export default function LoginPage() {
    return (
        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
            <div className="flex justify-center mb-8">
                <img src="/logo.png" alt="Brainy Logo" className="h-12 object-contain" />
            </div>
            <LoginClient />
        </div>
    );
}
