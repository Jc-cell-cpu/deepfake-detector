import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import logger from "@/lib/logger";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    logger.warn("Missing email in check-2fa request");
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    logger.warn("User not found in check-2fa", { email });
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  logger.info("Checked 2FA status", {
    email,
    twoFactorEnabled: user.twoFactorEnabled,
  });

  return NextResponse.json({
    twoFactorEnabled: user.twoFactorEnabled && !!user.twoFactorSecret,
  });
}
