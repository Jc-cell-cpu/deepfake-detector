/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authenticator } from "otplib";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const { action } = body; // "enable" or "disable"

  if (action === "disable") {
    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return NextResponse.json({ message: "Two-factor authentication disabled" });
  }

  // Enable 2FA (existing logic)
  const secret = authenticator.generateSecret();
  console.log("Generated 2FA secret for user:", secret);

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret, twoFactorEnabled: true },
  });

  const otpAuthUrl = authenticator.keyuri(user.email, "DefakeZone", secret);
  console.log("OTPAuth URL:", otpAuthUrl);
  const qrCode = await QRCode.toDataURL(otpAuthUrl);

  return NextResponse.json({
    qrCode,
    message: "Scan this QR code with your authenticator app",
  });
}
