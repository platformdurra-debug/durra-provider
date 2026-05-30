import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ROLES = ["provider"];
const isDev = process.env.NODE_ENV === "development";
const APPS: Record<string, string> = {
  customer:  isDev ? "http://localhost:3000" : "https://durrahonline.com",
  seller:    isDev ? "http://localhost:3001" : "https://seller.durrahonline.com",
  provider:  isDev ? "http://localhost:3002" : "https://provider.durrahonline.com",
  admin:     isDev ? "http://localhost:3003" : "https://admin.durrahonline.com",
  warehouse: isDev ? "http://localhost:3004" : "https://warehouse.durrahonline.com",
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (
    path.startsWith("/_next") || path.startsWith("/api") ||
    path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".svg") || path.endsWith(".ico") ||
    path === "/manifest.json" || path === "/sw.js" || path === "/auth"
  ) return NextResponse.next();

  const role = request.cookies.get("durra-role")?.value;
  if (!role) return NextResponse.redirect(new URL("/auth", request.url));
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.redirect(APPS[role] || APPS.customer);
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
