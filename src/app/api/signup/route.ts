/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import logger from "@/lib/logger";
import { sendMail } from "@/lib/mailer";

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided email, password, name, and username.
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
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               name:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid input or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already in use"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export async function POST(request: NextRequest) {
  const { email, password, name, username } = await request.json();

  logger.info("Processing user registration", { email });

  if (!email || !password) {
    logger.warn("Missing required fields", { email, hasPassword: !!password });
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 }
    );
  }

  // Check if user already exists
  logger.debug("Checking if user exists", { email });
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    logger.warn("Email already in use", { email });
    return NextResponse.json(
      { message: "Email already in use" },
      { status: 400 }
    );
  }

  // Hash the password
  logger.debug("Hashing password", { email });
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  try {
    logger.debug("Creating new user", { email, name, username });
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    logger.info("User created successfully", { userId: user.id, email });

    // Send welcome email
    try {
      logger.info("Sending welcome email", { email });
      await sendMail(
        email,
        "Welcome to DefakeZone!",
        `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to DefakeZone</title>
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
                          Welcome to DefakeZone!
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
                                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#10b981"/>
                              </svg>
                              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #10b981;">
                                Account Created Successfully
                              </h2>
                              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #e2e8f0;">
                                Hello ${name || "User"},<br/>
                                Thank you for joining DefakeZone! Your account has been successfully created.
                              </p>
                              <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #e2e8f0;">
                                Start exploring our platform to detect deepfakes and secure your digital content. If you have any questions, feel free to reach out to our support team.
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
      logger.info("Welcome email sent successfully", { email });
    } catch (error) {
      logger.error("Failed to send welcome email", {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't fail the request if email sending fails
    }

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to create user", {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
