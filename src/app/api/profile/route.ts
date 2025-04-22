/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/profile/route.ts (example)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}
