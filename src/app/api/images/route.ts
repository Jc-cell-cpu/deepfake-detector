import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // Optional pagination parameters with defaults
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
      { status: 400 }
    );
  }

  try {
    // Only use authenticated user's ID to query
    const userId = parseInt(session.user.id);

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.image.count({
        where: { userId },
      }),
    ]);

    return NextResponse.json(
      {
        data: images,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Image fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
