import LoginClient from "./LoginClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "تسجيل الدخول | Brainy",
    description: "سجل دخولك إلى منصة BRAINY",
};

export default function LoginPage() {
    return <LoginClient />;
}
