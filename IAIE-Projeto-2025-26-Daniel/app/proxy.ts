import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    if (!pathname.startsWith("/moloni/")) {
        return NextResponse.next();
    }

    const cookieStore = request.cookies;

    const accessTokenExists = !!cookieStore.get("moloni_access_token")?.value;
    const refreshTokenExists = !!cookieStore.get("moloni_refresh_token")?.value;

    // ---------------------------------------------------
    // 1️⃣ Access token não existe → tentar refresh
    // ---------------------------------------------------
    if (!accessTokenExists && refreshTokenExists) {
        const refreshRes = await fetch(`${request.nextUrl.origin}/api/moloniAccess/refresh`, {
            method: "POST",
            credentials: "include",
        });

        if (!refreshRes.ok) {
            return new NextResponse("Failed to refresh token", { status: 401 });
        }
    }

    // ---------------------------------------------------
    // 2️⃣ Nem access token nem refresh token → login inicial
    // ---------------------------------------------------
    if (!accessTokenExists && !refreshTokenExists) {
        const loginRes = await fetch(`${request.nextUrl.origin}/api/moloniAccess/get`, {
            method: "POST",
            credentials: "include",
        });

        if (!loginRes.ok) {
            return new NextResponse("Authentication required", { status: 401 });
        }
    }
}

export const config = {
    matcher: "/moloni/:path*",
};
