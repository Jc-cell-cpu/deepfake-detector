import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * @swagger
 * /api/reactivate-account/verify:
 *   post:
 *     summary: Verify the reactivation code and reactivate the account
 *     description: Verifies the provided code and reactivates the user's account if valid.
 *     tags: [Account Reactivation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "A1B2C3"
 *     responses:
 *       200:
 *         description: Account reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account reactivated successfully"
 *       400:
 *         description: Invalid code or account already active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired code"
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      logger.warn("Missing email or code for reactivation verification");
      return NextResponse.json(
        { message: "Email and code are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn("User not found for reactivation", { email });
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    if (user.isActive) {
      logger.warn("Account is already active", { email });
      return NextResponse.json(
        { message: "Account is already active" },
        { status: 400 }
      );
    }

    const resetEntry = await prisma.passwordReset.findUnique({
      where: { email },
    });

    if (
      !resetEntry ||
      resetEntry.code !== code ||
      resetEntry.expiresAt < new Date()
    ) {
      logger.warn("Invalid or expired reactivation code", { email });
      return NextResponse.json(
        { message: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Reactivate the account
    await prisma.user.update({
      where: { email },
      data: { isActive: true },
    });

    // Delete the used code
    await prisma.passwordReset.delete({
      where: { email },
    });

    logger.info("Account reactivated successfully", { email });
    return NextResponse.json(
      { message: "Account reactivated successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error verifying reactivation code", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { message: "Failed to reactivate account" },
      { status: 500 }
    );
  }
}
