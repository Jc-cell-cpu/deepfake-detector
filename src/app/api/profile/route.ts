/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

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

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const image = formData.get("image") as File | null;

  // If updating password, validate oldPassword, newPassword, and confirmPassword
  if (newPassword || confirmPassword || oldPassword) {
    // Ensure all password fields are provided
    if (!oldPassword || !newPassword || !confirmPassword) {
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
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 400 }
      );
    }

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
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
  }

  // Hash the new password if provided
  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    updateData.password = hashedPassword;
  }

  try {
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

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
