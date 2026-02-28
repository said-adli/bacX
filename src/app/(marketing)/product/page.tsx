import { Metadata } from "next";
import { ProductClient } from "@/components/marketing/ProductClient";

export const metadata: Metadata = {
    title: "ميزات المنصة | BRAINY",
    description: "اكتشف تكنولوجيا التعلم المتقدمة من Brainy. جودة سينمائية 4K، إحصائيات دقيقة لتقدم مستواك، وبيئة محفزة للنجاح.",
    openGraph: {
        title: "ميزات منصة Brainy للتفوق الأكاديمي",
        description: "تعرف على الأدوات التي ستغير طريقة دراستك للبكالوريا جذرياً.",
    },
};

export default function ProductPage() {
    return <ProductClient />;
}
