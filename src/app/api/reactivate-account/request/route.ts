import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { randomBytes } from "crypto";
import { sendMail } from "@/lib/mailer";

/**
 * @swagger
 * /api/reactivate-account/request:
 *   post:
 *     summary: Request a reactivation code for an inactive account
 *     description: Generates a verification code and sends it to the user's email for account reactivation.
 *     tags: [Account Reactivation]
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
 *                 description: User's email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reactivation code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reactivation code sent to your email"
 *       400:
 *         description: Invalid input or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found or account is already active"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!body.hasOwnProperty("email")) {
      logger.warn("Email field missing in reactivation request");
      return NextResponse.json(
        { message: "Email field is missing in the request" },
        { status: 400 }
      );
    }

    if (!email) {
      logger.warn("Email is empty in reactivation request");
      return NextResponse.json(
        { message: "Email cannot be empty" },
        { status: 400 }
      );
    }

    // Find user by email only
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

    // Generate a verification code
    const code = randomBytes(3).toString("hex").toUpperCase(); // e.g., "A1B2C3"
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Store the code in the PasswordReset table (reusing for reactivation)
    await prisma.passwordReset.upsert({
      where: { email: user.email },
      update: {
        code,
        expiresAt,
      },
      create: {
        email: user.email,
        code,
        expiresAt,
      },
    });

    // Send email with the code
    logger.info("Attempting to send verification email", { email: user.email });
    await sendMail(
      user.email,
      "Account Reactivation Code",
      `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Reactivation Code</title>
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
                        Account Reactivation Request
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
                              <path d="M21 8v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8m0 0l9-6 9 6M12 12v4m0 0h.01" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #a855f7;">
                              Your Reactivation Code
                            </h2>
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #e2e8f0;">
                              Use the code below to reactivate your account. This code will expire in 15 minutes.
                            </p>
                            <div style="display: inline-block; padding: 12px 24px; background-color: #4a1d6e; border-radius: 6px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                              <span style="font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 4px;">
                              ${code}
                              </span>
                            </div>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #e2e8f0;">
                              If you did not request account reactivation, please secure your account and contact support immediately.
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

    logger.info("Reactivation code sent", { email: user.email });
    return NextResponse.json(
      { message: "Reactivation code sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error sending reactivation code", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { message: "Failed to send reactivation code" },
      { status: 500 }
    );
  }
}
