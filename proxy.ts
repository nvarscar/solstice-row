import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Normalize trailing slash so /admin/login/ and /admin/login both work
  const p = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  const isAdminPage = p.startsWith("/admin") && p !== "/admin/login";
  const isContentApi = pathname.startsWith("/api/content");
  const isChangePasswordApi = pathname === "/api/auth/change-password";

  if (isAdminPage || isContentApi || isChangePasswordApi) {
    const token = request.cookies.get("solstice_auth")?.value;
    if (!token) {
      if (isAdminPage) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/content/:path*", "/api/auth/change-password"],
};
