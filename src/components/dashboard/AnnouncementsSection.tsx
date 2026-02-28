import { getDashboardAnnouncements, getDashboardSchedules } from "@/services/dashboard.service";
import UpdatesSection from "./UpdatesSection";

export default async function AnnouncementsSection() {
    const announcements = await getDashboardAnnouncements();
    const schedules = await getDashboardSchedules();

    return <UpdatesSection announcements={announcements} schedules={schedules} />;
}
