// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { authenticator } from "otplib";

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
        console.log("Starting authorization...");

        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("User not found");
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );

        if (!isValidPassword) {
          console.log("Invalid password");
          return null;
        }

        console.log("Password is valid");

        if (user.twoFactorEnabled && user.twoFactorSecret) {
          console.log("2FA is enabled");
          console.log("User 2FA secret:", user.twoFactorSecret);

          const providedCode = credentials.twoFACode || "";
          console.log("2FA code provided:", providedCode);
          console.log("Verifying 2FA code:", providedCode);

          const generatedCode = authenticator.generate(user.twoFactorSecret);
          console.log("Generated Code (server):", generatedCode);
          console.log("User Provided Code:", providedCode);

          const isValid = authenticator.check(
            providedCode,
            user.twoFactorSecret
          );
          console.log("Is Valid:", isValid);

          if (!isValid) {
            console.log("Invalid 2FA code");
            return null;
          }

          console.log("2FA valid, login success");
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
        token.image = user.image; // Add this
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string; //
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
