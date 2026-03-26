import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-dev-only"
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  // Define protected routes and their required roles
  const protectedRoutes = [
    { path: "/admin", roles: ["ADMIN"] },
    { path: "/placement-officers", roles: ["PLACEMENT_OFFICER", "ADMIN"] },
    { path: "/students", roles: ["STUDENT", "PLACEMENT_OFFICER", "ADMIN"] },
  ];

  const matchedRoute = protectedRoutes.find(r => pathname.startsWith(r.path));

  if (matchedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      const userRole = payload.role as string;

      if (!matchedRoute.roles.includes(userRole)) {
        // Redirect to their own dashboard if they have the wrong role
        if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
        if (userRole === "PLACEMENT_OFFICER") return NextResponse.redirect(new URL("/placement-officers", req.url));
        if (userRole === "STUDENT") return NextResponse.redirect(new URL("/students", req.url));
        
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/placement-officers/:path*",
    "/students/:path*",
  ],
};
