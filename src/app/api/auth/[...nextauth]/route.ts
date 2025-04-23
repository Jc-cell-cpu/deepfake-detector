/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { authenticator } from "otplib";
import logger from "@/lib/logger";

const prisma = new PrismaClient();

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

        logger.debug("User details", {
          email: user.email,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorSecret: user.twoFactorSecret ? "set" : "not set",
        });

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );

        if (!isValidPassword) {
          logger.warn("Invalid password", { email: credentials.email });
          throw new Error("INVALID_CREDENTIALS");
        }

        logger.info("Password is valid", { email: credentials.email });

        if (user.twoFactorEnabled && user.twoFactorSecret) {
          logger.info("2FA is enabled", { email: credentials.email });

          const providedCode = credentials.twoFACode || "";
          if (!providedCode) {
            logger.info("2FA code required but not provided", {
              email: credentials.email,
            });
            throw new Error("2FA_REQUIRED");
          }

          logger.debug("Verifying 2FA code", {
            email: credentials.email,
            providedCode,
          });

          const generatedCode = authenticator.generate(user.twoFactorSecret);
          logger.debug("Generated 2FA code", {
            email: credentials.email,
            generatedCode,
          });

          const isValid = authenticator.check(
            providedCode,
            user.twoFactorSecret
          );
          logger.debug("2FA validation result", {
            email: credentials.email,
            isValid,
          });

          if (!isValid) {
            logger.warn("Invalid 2FA code", { email: credentials.email });
            throw new Error("INVALID_2FA_CODE");
          }

          logger.info("2FA valid, login success", { email: credentials.email });
        } else {
          logger.info("2FA not enabled for user", { email: credentials.email });
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.image = user.image;
        logger.debug("Updated JWT token", {
          userId: user.id,
          email: user.email,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        logger.debug("Updated session", {
          userId: token.id,
          email: token.email,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
