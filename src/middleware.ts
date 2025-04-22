// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (!req.nextauth.token?.id) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token?.id, // Only allow fully authenticated users
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/history", "/profile"],
};
