/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import { sendMail } from "@/lib/mailer";
import logger from "@/lib/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @swagger
 * /api/password-reset/verify:
 *   post:
 *     summary: Verify password reset code and optionally update password
 *     description: Verifies a password reset code and, if new password data is provided, updates the user's password. The code expires in 15 minutes.
 *     tags: [Authentication]
 *     security:
 *       - BasicAuth: []
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
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Successful code verification or password update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Code verified successfully"
 *       400:
 *         description: Invalid input, expired code, or password mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Passwords do not match"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Update failed"
 */
export async function POST(request: NextRequest) {
  const { email, code, newPassword, confirmPassword } = await request.json();

  logger.info("Processing password reset verification", { email });

  // Validate required fields for code verification
  if (
    typeof email !== "string" ||
    typeof code !== "string" ||
    !email.trim() ||
    !code.trim()
  ) {
    logger.warn("Missing or invalid email/code", { email, code });
    return NextResponse.json(
      { message: "Email and code are required" },
      { status: 400 }
    );
  }

  // Verify reset code
  logger.debug("Verifying password reset code", { email, code });
  const passwordReset = await prisma.passwordReset.findUnique({
    where: { email },
  });

  if (!passwordReset || passwordReset.code !== code) {
    logger.warn("Invalid or mismatched verification code", { email, code });
    return NextResponse.json(
      { message: "Invalid or expired verification code" },
      { status: 400 }
    );
  }

  if (new Date(passwordReset.expiresAt) < new Date()) {
    logger.warn("Verification code expired", {
      email,
      expiresAt: passwordReset.expiresAt,
    });
    return NextResponse.json(
      { message: "Verification code has expired" },
      { status: 400 }
    );
  }

  // If newPassword and confirmPassword are not provided, this is a code verification request
  if (newPassword === undefined && confirmPassword === undefined) {
    logger.info("Code verified successfully", { email });
    return NextResponse.json(
      { message: "Code verified successfully" },
      { status: 200 }
    );
  }

  // Validate password reset fields
  logger.debug("Validating password reset fields", {
    hasNewPassword: !!newPassword,
    hasConfirmPassword: !!confirmPassword,
  });
  if (
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string" ||
    !newPassword.trim() ||
    !confirmPassword.trim()
  ) {
    logger.warn("Missing or invalid password fields", { email });
    return NextResponse.json(
      { message: "New password and confirm password are required" },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    logger.warn("Password mismatch", { email });
    return NextResponse.json(
      { message: "Passwords do not match" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    logger.warn("Password too short", { email, length: newPassword.length });
    return NextResponse.json(
      { message: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  // Get the user
  logger.debug("Looking up user for password reset", { email });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.warn("User not found for password reset", { email });
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Ensure the new password is different
  const isSame = await bcrypt.compare(newPassword, user.password || "");
  if (isSame) {
    logger.warn("New password same as current password", { email });
    return NextResponse.json(
      { message: "New password must be different from the current password" },
      { status: 400 }
    );
  }

  // Hash and update the new password
  logger.debug("Hashing and updating new password", { email });
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      updatedAt: new Date(), // Manually set updatedAt since it's nullable
    },
  });

  // Delete used password reset entry
  logger.debug("Deleting used password reset entry", { email });
  await prisma.passwordReset.delete({ where: { email } });

  // Optionally send confirmation email (only works if domain is verified)
  try {
    logger.info("Sending password update confirmation email", { email });
    await sendMail(
      email,
      "Password Reset Verification Code",
      `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Successfully Updated</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: #1a1a1a; color: #e2e8f0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0; background: linear-gradient(180deg, #2d1b4e 0%, #1a1a1a 100%);">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; border-collapse: collapse;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 20px 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; background: linear-gradient(90deg, #a855f7, #ec4899); -webkit-background-clip: text; background-clip: text; color: transparent;">
                        Password Updated
                      </h1>
                    </td>
                  </tr>
                  <!-- Main Content -->
                  <tr>
                    <td style="background-color: #2d3748; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="text-align: center;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto 20px;">
                              <path d="M9 12l2 2 4-4m-6 8a9 9 0 110-18 9 9 0 010 18z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #10b981;">
                              Password Changed Successfully
                            </h2>
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #e2e8f0;">
                              Your password has been updated successfully. You can now log in with your new password.
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #e2e8f0;">
                              If you did not perform this action, please secure your account and contact support immediately.
                            </p>
                            <a href="mailto:ssmohapatra427@gmail.com" style="display: inline-block; padding: 12px 24px; background: linear-gradient(90deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                              Contact Support
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                        © ${new Date().getFullYear()} DefakeZone. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0; font-size: 14px; color: #94a3b8;">
                        If you have any questions, feel free to <a href="mailto:ssmohapatra427@gmail.com" style="color: #a855f7; text-decoration: underline;">reach out</a>.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    );
    logger.info("Password update confirmation email sent", { email });
  } catch (error) {
    logger.error("Failed to send confirmation email", {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't fail the request if email fails
  }

  logger.info("Password updated successfully", { email });
  return NextResponse.json(
    { message: "Password updated successfully" },
    { status: 200 }
  );
}
