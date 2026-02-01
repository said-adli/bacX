
import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the cookie immediately
    response.cookies.delete("brainy_session");

    // Attempt to clear other potential legacy cookies just in case
    response.cookies.set("brainy_session", "", { maxAge: 0, path: '/' });

    return response;
}
