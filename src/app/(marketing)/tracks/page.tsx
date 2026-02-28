import { Metadata } from "next";
import { TracksClient } from "@/components/marketing/TracksClient";

export const metadata: Metadata = {
    title: "مسارات البكالوريا | BRAINY",
    description: "تصفح مسارات البكالوريا المختلفة بما في ذلك العلوم التجريبية، الرياضيات، وتقني رياضي. مواد ودروس مخصصة لشعبتك.",
};

export default function TracksPage() {
    return <TracksClient />;
}
