import LoginClient from "./LoginClient";
import { AuthLayoutShell } from "@/components/layout/AuthLayoutShell";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "تسجيل الدخول",
    description: "سجل دخولك إلى منصة BRAINY",
};

export default function LoginPage() {
    return (
        <AuthLayoutShell title="Login">
            <LoginClient />
        </AuthLayoutShell>
    );
}
