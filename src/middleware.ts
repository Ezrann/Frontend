import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/products",
  "/categories",
];

// Protected routes that require authentication
const protectedRoutes = ["/profile", "/products/add"];

// Admin-only routes
const adminRoutes = ["/admin/dashboard"];

// Check if a route matches a pattern (supports dynamic routes)
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (pathname === route) return true;

    // Dynamic route match (e.g., /products/[id])
    const routePattern = route.replace(/\[.*?\]/g, "[^/]+");
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
  });
}

// Check if pathname starts with any of the routes
function startsWithRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token and role from cookies
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  // Check if route is public
  const isPublicRoute =
    matchesRoute(pathname, publicRoutes) ||
    pathname.startsWith("/products/") ||
    pathname.startsWith("/categories/");

  // Check if route is protected (requires auth)
  const isProtectedRoute = startsWithRoute(pathname, protectedRoutes);

  // Check if route is admin-only
  const isAdminRoute = startsWithRoute(pathname, adminRoutes);

  // Allow public routes
  if (isPublicRoute && !isProtectedRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access
  if (isAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is admin (case-insensitive)
    const normalizedRole = role?.toLowerCase()?.trim();
    const isAdmin =
      normalizedRole === "admin" ||
      normalizedRole === "administrator" ||
      role === "Admin" ||
      role === "ADMIN";

    // If role not in cookie but token exists, allow through (client-side will verify)
    // This handles cases where cookie wasn't set but localStorage has the role
    if (!role && token) {
      console.log("Middleware: Role not in cookie but token exists, allowing through for client-side check");
      return NextResponse.next();
    }

    if (!isAdmin) {
      // Redirect to home with error message
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "access_denied");
      return NextResponse.redirect(homeUrl);
    }
  }

  // Allow access to protected routes with valid token
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

