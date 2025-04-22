// app/api/2fa/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authenticator } from "otplib";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { code } = await request.json();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || !user.twoFactorSecret) {
    return NextResponse.json(
      { message: "User not found or 2FA not set up" },
      { status: 404 }
    );
  }

  const isValid = authenticator.check(code, user.twoFactorSecret);
  if (!isValid) {
    return NextResponse.json(
      { message: "Invalid verification code" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  return NextResponse.json(
    { message: "2FA enabled successfully" },
    { status: 200 }
  );
}
