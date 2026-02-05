import { getDashboardAnnouncements } from "@/services/dashboard.service";
import UpdatesSection from "./UpdatesSection";

export default async function AnnouncementsSection() {
    const announcements = await getDashboardAnnouncements();

    return <UpdatesSection announcements={announcements} />;
}
