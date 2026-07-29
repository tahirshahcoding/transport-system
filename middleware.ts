import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("transport_session")?.value;
  const isAuthenticated = session === "authenticated";
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|api/auth).*)",
  ],
};
