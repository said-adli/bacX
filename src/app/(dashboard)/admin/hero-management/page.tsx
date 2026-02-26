import { HeroSlideManager } from "@/components/admin/HeroSlideManager";
import { getAllHeroSlides } from "@/actions/admin-hero";

export const metadata = {
    title: "إدارة واجهة المنصة",
    description: "لوحة التحكم في إعلانات الواجهة الرئيسية",
};

export default async function HeroManagementPage() {
    // 1. Fetch data on the server
    const slides = await getAllHeroSlides();

    // 2. Pass to interactive client component
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-wide border-r-4 border-blue-500 pr-4">إدارة الإعلانات</h1>
                <p className="text-white/40 mt-2 mr-5">التحكم في واجهة البانر الرئيسية والصور المتحركة</p>
            </div>

            <HeroSlideManager initialSlides={slides} />
        </div>
    );
}
