/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { authenticator } from "otplib";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFACode: {
          label: "2FA Code",
          type: "text",
          placeholder: "6-digit code",
          required: false,
        },
      },
      async authorize(credentials) {
        logger.info("Starting authorization", { email: credentials?.email });

        if (!credentials?.email || !credentials?.password) {
          logger.warn("Missing credentials", { email: credentials?.email });
          throw new Error("MISSING_CREDENTIALS");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          logger.warn("User not found", { email: credentials.email });
          throw new Error("USER_NOT_FOUND");
        }

        if (!user.isActive) {
          logger.warn("User account is inactive", { email: credentials.email });
          throw new Error("ACCOUNT_INACTIVE");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );

        if (!isValidPassword) {
          logger.warn("Invalid password", { email: credentials.email });
          throw new Error("INVALID_CREDENTIALS");
        }

        if (user.twoFactorEnabled && user.twoFactorSecret) {
          const providedCode = credentials.twoFACode || "";
          if (!providedCode) {
            logger.info("2FA code required but not provided", {
              email: credentials.email,
            });
            throw new Error("2FA_REQUIRED");
          }

          const isValid = authenticator.check(
            providedCode,
            user.twoFactorSecret
          );
          if (!isValid) {
            logger.warn("Invalid 2FA code", { email: credentials.email });
            throw new Error("INVALID_2FA_CODE");
          }

          logger.info("2FA valid, login success", { email: credentials.email });
        }

        return {
          id: user.id.toString(),
          email: user.email, // Kept for logging, but not added to token
        };
      },
    }),
  ],

  // Use JWT strategy to avoid session cookie chunking
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Only include the id (minimize payload)
        logger.debug("Updated JWT token", { userId: user.id });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  // Enable debug mode to inspect JWT size
  debug: process.env.NODE_ENV !== "production",

  // Keep your secret secure
  secret: process.env.NEXTAUTH_SECRET,

  // Cookie config for consistent dev/prod behavior
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
