/* eslint-disable @typescript-eslint/no-unused-vars */
import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";

const SWAGGER_ENVS = ["development", "staging"];

function swaggerMiddleware(request: NextRequest) {
  const env = process.env.NODE_ENV || "development";

  // Redirect to homepage if not in allowed environments
  if (!SWAGGER_ENVS.includes(env)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const authHeader = request.headers.get("authorization");
  const swaggerUser = process.env.SWAGGER_USER || "admin";
  const swaggerPassword = process.env.SWAGGER_PASSWORD || "password";

  if (!authHeader) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Swagger UI"',
      },
    });
  }

  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");

  if (username !== swaggerUser || password !== swaggerPassword) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Swagger UI"',
      },
    });
  }

  return NextResponse.next();
}

export default withAuth(
  function middleware(req) {
    // Handle Swagger routes first
    if (
      req.nextUrl.pathname.startsWith("/docs") ||
      req.nextUrl.pathname.startsWith("/docs-json")
    ) {
      return swaggerMiddleware(req);
    }

    // Existing withAuth logic for protected routes
    if (!req.nextauth.token?.id) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },

  {
    callbacks: {
      authorized: ({ token }) => !!token?.id,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/history", "/profile", "/docs/:path*", "/docs-json/:path*"],
};
