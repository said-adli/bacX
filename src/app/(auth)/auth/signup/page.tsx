import { createClient } from "@/utils/supabase/server";
import SignupForm from "./SignupForm";

export const metadata = {
    title: "إنشاء حساب | Brainy",
    description: "انضم إلى منصة Brainy التعليمية",
};

export default async function SignupPage() {
    const supabase = await createClient();

    // Fetch Wilayas (Sorted by ID)
    const { data: wilayas, error: wilayaError } = await supabase
        .from("wilayas")
        .select("id, name_ar, name_en")
        .order("id", { ascending: true });

    // Fetch Majors (Sorted Alphabetically by Label)
    const { data: majors, error: majorError } = await supabase
        .from("majors")
        .select("id, label")
        .order("label", { ascending: true });

    if (wilayaError || majorError) {
        console.error("Error fetching signup data:", wilayaError, majorError);
    }

    return (
        <SignupForm
            wilayas={wilayas || []}
            majors={majors || []}
        />
    );
}
