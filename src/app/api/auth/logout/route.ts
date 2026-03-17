
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    const supabase = await createClient();

    // 1. Server-Side SignOut (Invalidates Refresh Token)
    await supabase.auth.signOut();

    const response = NextResponse.json({ success: true });
    const cookieStore = await cookies();

    // 2. Clear Application Session Cookie
    response.cookies.set("brainy_session", "", { maxAge: 0, path: '/' });

    // 3. Clear Supabase Auth Cookies (All `sb-` prefixed cookies)
    const allCookies = cookieStore.getAll();
    allCookies.forEach((cookie) => {
        if (cookie.name.startsWith("sb-")) {
            response.cookies.set(cookie.name, "", { maxAge: 0, path: '/' });
        }
    });

    return response;
}
