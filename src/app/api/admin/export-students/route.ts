import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(_req: NextRequest) {
    // 1. Security Check: Verify Admin
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    // 2. Audit Log
    // Using import() to avoid circular deps or server-side issues if any
    const { logAdminAction } = await import('@/lib/admin-logger');
    await logAdminAction(
        "EXPORT_STUDENTS",
        user.id,
        "system",
        { action: "export_csv", timestamp: new Date().toISOString() }
    );

    // 3. Fetch Data (Streaming/Batched approach ideal, but simple fetch for V1)
    // Using Admin Client to ensure we get ALL users regardless of potential RLS hiccups on read
    const adminClient = createAdminClient();

    // Select fields for export
    const { data: students, error: dbError } = await adminClient
        .from('profiles')
        .select(`
            full_name,
            email,
            wilaya,
            created_at,
            is_subscribed,
            subscription_end_date,
            role,
            is_banned
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false });

    if (dbError) {
        console.error("Export DB Error:", dbError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // 3. Generate CSV Content
    // Header Row
    const headers = [
        "Full Name",
        "Email",
        "Wilaya",
        "Status",
        "Subscription End",
        "Registration Date",
        "Account Status"
    ];

    // Data Rows
    const rows = students?.map(student => {
        const status = student.is_subscribed ? "Active" : "Expired";
        const accountStatus = student.is_banned ? "Banned" : "Active";
        const cleanName = (student.full_name || "").replace(/"/g, '""'); // Escape quotes
        const cleanWilaya = (student.wilaya || "").replace(/"/g, '""');

        return [
            `"${cleanName}"`,
            student.email || "",
            `"${cleanWilaya}"`,
            status,
            student.subscription_end_date ? new Date(student.subscription_end_date).toLocaleDateString("en-GB") : "N/A",
            new Date(student.created_at).toLocaleDateString("en-GB"),
            accountStatus
        ].join(",");
    });

    const csvContent = [headers.join(","), ...(rows || [])].join("\n");
    // Add BOM for Excel UTF-8 compatibility
    const bom = "\uFEFF";
    const finalCsv = bom + csvContent;

    // 4. Return Stream/Response
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `students_export_${dateStr}.csv`;

    return new NextResponse(finalCsv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}
