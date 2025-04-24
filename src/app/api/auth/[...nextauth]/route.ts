/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { authenticator } from "otplib";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma"; // Ensure prisma is imported

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

        // Check if the account is active
        if (!user.isActive) {
          logger.warn("User account is inactive", { email: credentials.email });
          throw new Error("ACCOUNT_INACTIVE");
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
          image: user.image,
          username: user.username,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorSecret: user.twoFactorSecret,
          isActive: user.isActive,
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
        token.username = user.username;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.twoFactorSecret = user.twoFactorSecret;
        token.isActive = user.isActive;
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
        session.user.username = token.username;
        session.user.twoFactorEnabled = token.twoFactorEnabled;
        session.user.twoFactorSecret = token.twoFactorSecret;
        session.user.isActive = token.isActive;
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

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Sign in a user with email, password, and 2FA if enabled
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               twoFACode:
 *                 type: string
 *                 example: "123456"
 *                 description: >
 *                   Only required if 2FA is enabled for the user.
 *                   Will be ignored otherwise.
 *     responses:
 *       200:
 *         description: Successfully signed in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *       400:
 *         description: Missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: MISSING_CREDENTIALS
 *       401:
 *         description: Invalid credentials, user not found, or account inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: INVALID_CREDENTIALS
 *       403:
 *         description: 2FA required or invalid 2FA code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 2FA_REQUIRED
 */

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
