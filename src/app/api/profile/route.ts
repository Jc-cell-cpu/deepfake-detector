/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";
import logger from "@/lib/logger";

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Retrieve the authenticated user's profile
 *     description: Fetches the profile details of the authenticated user based on their session email.
 *     tags: [User Profile]
 *     security:
 *       - BasicAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                   format: email
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                   format: base64
 *                 username:
 *                   type: string
 *                 twoFactorEnabled:
 *                   type: boolean
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
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
 *   post:
 *     summary: Update the authenticated user's profile
 *     description: Updates the profile details (name, username, image, or password) of the authenticated user.
 *     tags: [User Profile]
 *     security:
 *       - BasicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               oldPassword:
 *                 type: string
 *                 example: "OldPassword123!"
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file to upload
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *               when: "updating password"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                   format: email
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                   format: base64
 *                 username:
 *                   type: string
 *                 twoFactorEnabled:
 *                   type: boolean
 *       400:
 *         description: Invalid input or password mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Old password is incorrect"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
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
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  logger.info("Fetching user profile", { userEmail: session?.user?.email });

  if (!session?.user?.email) {
    logger.warn("Unauthorized access attempt to profile");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  logger.debug("Looking up user", { email: session.user.email });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      username: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    logger.warn("User not found", { email: session.user.email });
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  logger.info("User profile fetched successfully", { userId: user.id });
  return NextResponse.json(user);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  logger.info("Attempting to update user profile", {
    userEmail: session?.user?.email,
  });

  if (!session?.user?.email) {
    logger.warn("Unauthorized access attempt to update profile");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    logger.warn("User not found for profile update", {
      email: session.user.email,
    });
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const image = formData.get("image") as File | null;

  // If updating password, validate oldPassword, newPassword, and confirmPassword
  if (newPassword || confirmPassword || oldPassword) {
    logger.debug("Password update requested", {
      hasOld: !!oldPassword,
      hasNew: !!newPassword,
      hasConfirm: !!confirmPassword,
    });

    // Ensure all password fields are provided
    if (!oldPassword || !newPassword || !confirmPassword) {
      logger.warn("Incomplete password fields provided");
      return NextResponse.json(
        {
          message:
            "Old password, new password, and confirm password are required",
        },
        { status: 400 }
      );
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password || ""
    );
    if (!isOldPasswordValid) {
      logger.warn("Old password verification failed", { email: user.email });
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 400 }
      );
    }

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      logger.warn("New password and confirm password mismatch");
      return NextResponse.json(
        { message: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    // Check if new password is different from the current password
    const isSameAsCurrent = await bcrypt.compare(
      newPassword,
      user.password || ""
    );
    if (isSameAsCurrent) {
      logger.warn("New password same as current password");
      return NextResponse.json(
        { message: "New password must be different from the current password" },
        { status: 400 }
      );
    }
  }

  // Prepare the data to update
  const updateData: any = {};
  if (name) updateData.name = name;
  if (username) updateData.username = username;
  if (image) {
    const buffer = Buffer.from(await image.arrayBuffer());
    updateData.image = buffer.toString("base64"); // Store as base64 (simplified)
    logger.debug("Image processed for update", { hasImage: !!image });
  }

  // Hash the new password if provided
  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    updateData.password = hashedPassword;
    logger.debug("New password hashed", {
      passwordLength: hashedPassword.length,
    });
  }

  try {
    logger.debug("Updating user profile", { userId: user.id, updateData });
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        username: true,
        twoFactorEnabled: true,
      },
    });

    logger.info("User profile updated successfully", { userId: user.id });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    logger.error("Error updating profile", {
      userId: user?.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
