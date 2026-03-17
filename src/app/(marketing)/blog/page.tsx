import { Metadata } from "next";
import { BlogClient } from "@/components/marketing/BlogClient";

export const metadata: Metadata = {
    title: "مدونة المتفوقين | BRAINY",
    description: "اكتشف نصائح دراسية واستراتيجيات مراجعة شاملة لضمان التفوق في البكالوريا مع Brainy.",
};

export default function BlogPage() {
    return <BlogClient />;
}
