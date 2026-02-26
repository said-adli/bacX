import { notFound } from "next/navigation";
import { getStudentDetails } from "@/actions/admin-students";
import StudentDetailClient from "@/components/admin/students/StudentDetailClient";

export const metadata = {
  title: "ملف الطالب",
};


export default async function StudentDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const details = await getStudentDetails(id);

    if (!details) {
        notFound();
    }

    return (
        <StudentDetailClient
            student={details.profile}
            payments={details.payments}
            activityLogs={details.securityLogs}
            progress={details.recentProgress}
        />
    );
}
