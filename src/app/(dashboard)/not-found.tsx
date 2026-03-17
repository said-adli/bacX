import { NotFoundState } from "@/components/ui/NotFoundState";

export const metadata = {
  title: "الصفحة غير موجودة",
};


export default function DashboardNotFound() {
    return (
        <NotFoundState
            title="لم يتم العثور على المسار"
            message="عذراً، الرابط الذي تحاول الوصول إليه غير موجود في لوحة التحكم."
        />
    );
}
