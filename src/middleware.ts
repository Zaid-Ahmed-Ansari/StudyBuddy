import { middlewareAuth } from "@/src/lib/auth-edge"; // ✅ No Mongoose
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await middlewareAuth();

  const { pathname } = request.nextUrl;
  const protectedRoutes = [
    "/dashboard",
    "/ai-chat",
    "/notes-generator",
    "/schedule-generator",
  ];

  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (
    session &&
    (pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname === "/verify") 
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ai-chat/:path*",
    "/notes-generator/:path*",
    "/schedule-generator/:path*",
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
    "/"
  ],
};
