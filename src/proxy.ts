import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/projects",
  "/notifications",
  "/settings",
  "/admin",
];
const authPaths = ["/login", "/signup"];

export const proxy = async (request: NextRequest) => {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // ルートパス → 認証状態に応じてリダイレクト
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/dashboard" : "/login", request.url),
    );
  }

  // 未認証で保護ページにアクセス → /login へリダイレクト
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 認証済みでログイン/サインアップページにアクセス → /dashboard へリダイレクト
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

export default proxy;
