import Link from "next/link";
import Image from "next/image";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export const metadata = {
    title: "تحديث كلمة المرور",
    description: "تحديث كلمة المرور لحسابك في منصة Brainy",
};

export default function UpdatePasswordPage() {
    return (
        <div className="w-full max-w-md glass-card p-8 sm:p-10 shadow-2xl" dir="rtl">
            <Link href="/">
                <div className="flex justify-center mb-8">
                    <Image
                        src="/images/logo.png"
                        alt="Brainy Logo"
                        width={180}
                        height={56}
                        className="h-14 w-auto object-contain drop-shadow-md"
                        priority
                    />
                </div>
            </Link>
            {/* Heading */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">تعيين كلمة مرور جديدة</h1>
                <p className="text-sm text-zinc-400">قم باختيار كلمة مرور قوية لحماية حسابك</p>
            </div>

            <UpdatePasswordForm />
        </div>
    );
}
