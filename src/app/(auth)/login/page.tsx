import LoginClient from "./LoginClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "تسجيل الدخول",
    description: "سجل دخولك إلى منصة BRAINY",
};

export default function LoginPage() {
    return <LoginClient />;
}
