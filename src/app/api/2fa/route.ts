import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import logger from "@/lib/logger";

/**
 * @swagger
 * /api/setup-2fa:
 *   post:
 *     summary: Enable or disable two-factor authentication (2FA)
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [enable, disable]
 *                 example: enable
 *     responses:
 *       200:
 *         description: Operation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Two-factor authentication disabled
 *                 qrCode:
 *                   type: string
 *                   example: data:image/png;base64,...
 *       401:
 *         description: Unauthorized - session missing
 *       404:
 *         description: User not found
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    logger.warn("Unauthorized 2FA setup attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    logger.warn("User not found during 2FA setup", {
      email: session.user.email,
    });
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const { action } = body; // "enable" or "disable"

  if (action === "disable") {
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    logger.info("2FA disabled", { email: user.email });
    return NextResponse.json({ message: "Two-factor authentication disabled" });
  }

  // Enable 2FA
  const secret = authenticator.generateSecret();
  logger.info("Generated 2FA secret", { email: user.email });

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret, twoFactorEnabled: true },
  });

  const otpAuthUrl = authenticator.keyuri(user.email, "DefakeZone", secret);
  logger.info("Generated OTPAuth URL", { email: user.email, otpAuthUrl });

  const qrCode = await QRCode.toDataURL(otpAuthUrl);

  return NextResponse.json({
    qrCode,
    message: "Scan this QR code with your authenticator app",
  });
}
