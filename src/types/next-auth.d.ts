import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username?: string | null;
      twoFactorEnabled?: boolean;
      twoFactorSecret?: string;
      twoFactorVerified?: boolean;
      isActive?: boolean; // Add this field to session
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    username?: string | null;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    twoFactorVerified?: boolean;
    isActive?: boolean; // Add this field to user
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username?: string | null;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    twoFactorVerified?: boolean;
    isActive?: boolean; // Add this field to JWT
  }
}
