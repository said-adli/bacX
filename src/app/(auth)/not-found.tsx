import { NotFoundState } from "@/components/ui/NotFoundState";

export const metadata = {
  title: "الصفحة غير موجودة",
};


export default function AuthNotFound() {
    return (
        <NotFoundState
            title="صفحة المصادقة غير موجودة"
            message="لم نتمكن من العثور على صفحة الدخول أو التسجيل التي تبحث عنها."
            actionLink="/login"
            actionLabel="الذهاب لصفحة الدخول"
        />
    );
}
