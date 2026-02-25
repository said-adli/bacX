import { createAdminClient } from "@/utils/supabase/admin";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Clock } from "lucide-react";

export async function RecentSignupsList() {
    // 500ms Artificial Delay to demonstrate Streaming (remove in prod if desired, but good for demo)
    await new Promise(resolve => setTimeout(resolve, 500));

    const adminClient = createAdminClient();
    const { data: students } = await adminClient
        .from('profiles')
        .select('id, full_name, email, avatar_url, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .limit(5);

    if (!students || students.length === 0) {
        return <div className="p-4 text-center text-zinc-500">لا يوجد منضمين جدد.</div>;
    }

    return (
        <div className="space-y-4">
            {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <UserAvatar
                            src={student.avatar_url}
                            fallback={student.full_name || "?"}
                            className="w-10 h-10 border border-white/10"
                        />
                        <div>
                            <p className="text-white font-medium text-sm">{student.full_name || "مستخدم جديد"}</p>
                            <p className="text-zinc-500 text-xs">{student.email}</p>
                        </div>
                    </div>
                    <div className="text-end">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(student.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
