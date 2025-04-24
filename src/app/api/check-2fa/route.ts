import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import logger from "@/lib/logger";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/check-2fa:
 *   post:
 *     summary: Check if 2FA is enabled for a given user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 2FA status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 twoFactorEnabled:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing email in request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
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
