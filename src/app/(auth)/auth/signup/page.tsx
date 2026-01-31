import { createClient } from "@/utils/supabase/server";
import SignupForm from "./SignupForm";
import { AuthLayoutShell } from "@/components/layout/AuthLayoutShell";

export const metadata = {
    title: "انشاء حساب | Brainy",
    description: "انضم إلى منصة Brainy التعليمية",
};

export default async function SignupPage() {
    const supabase = await createClient();

    // 1. Fetch Wilayas (Sorted by ID)
    const { data: wilayas, error: wilayaError } = await supabase
        .from("wilayas")
        .select("id, full_label")
        .order("id", { ascending: true });

    // 2. Fetch Majors (Sorted Alphabetically by Label)
    const { data: majors, error: majorError } = await supabase
        .from("majors")
        .select("id, label")
        .order("label", { ascending: true });

    if (wilayaError || majorError) {
        console.error("Error fetching signup data:", wilayaError, majorError);
        // We could return a custom error UI, but for now we might render with empty lists or throw
        // throw new Error("Failed to load signup data");
    }

    return (
        <AuthLayoutShell title="Create Account">
            <SignupForm
                wilayas={wilayas || []}
                majors={majors || []}
            />
        </AuthLayoutShell>
    );
}
