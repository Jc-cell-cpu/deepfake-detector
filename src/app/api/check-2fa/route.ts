/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/check-2fa/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Check if the request body is present and valid
    const contentType = req.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    // Read the body once and parse it
    const body = await req.text();
    if (!body) {
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { email } = parsedBody;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { twoFactorEnabled: true },
    });

    return NextResponse.json({ twoFactorEnabled: !!user?.twoFactorEnabled });
  } catch (error) {
    console.error("Error processing 2FA check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
