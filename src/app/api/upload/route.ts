/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import sharp from "sharp";
import prisma from "@/lib/prisma";
import { runInference } from "@/lib/inference";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { randomUUID } from "crypto";

// Rate limiting (in-memory, simple implementation)
const requestLimits = new Map<string, { count: number; lastReset: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;
const RESET_INTERVAL = 60_000; // 1 minute in ms

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = requestLimits.get(userId) || { count: 0, lastReset: now };
  if (now - userLimit.lastReset > RESET_INTERVAL) {
    userLimit.count = 0;
    userLimit.lastReset = now;
  }
  if (userLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  userLimit.count += 1;
  requestLimits.set(userId, userLimit);
  return true;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting check
  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Validate file type and file size
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 10MB limit." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Check magic numbers for basic malware filtering
  const fileSignature = buffer.slice(0, 4).toString("hex").toLowerCase();
  const validMagicNumbers = {
    jpeg: ["ffd8ffe0", "ffd8ffe1", "ffd8ffe2", "ffd8ffe3", "ffd8ffe8"],
    png: ["89504e47"],
    webp: ["52494646"],
  };
  const dangerousSignatures = [
    "4d5a", // EXE
    "25504446", // PDF
    "504b0304", // ZIP/JAR/DOCX/XLSX
  ];
  const fileExtOriginal = file.name.split(".").pop()?.toLowerCase() || "";
  const magicStart = fileSignature.slice(0, 8);
  const isDangerous = dangerousSignatures.some((sig) =>
    magicStart.startsWith(sig)
  );
  if (isDangerous) {
    return NextResponse.json(
      { error: "Blocked potential malware. Suspicious file format." },
      { status: 400 }
    );
  }
  if (fileExtOriginal in validMagicNumbers) {
    const isValid = validMagicNumbers[
      fileExtOriginal as keyof typeof validMagicNumbers
    ].some((sig) => magicStart.startsWith(sig));
    if (!isValid) {
      console.warn(
        "Unusual image signature detected, allowing upload for now:",
        magicStart
      );
      // Optionally log unusual signature events
    }
  }

  // Create uploads folder if it doesn't exist
  const uploadFolder = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadFolder)) {
    await fsPromises.mkdir(uploadFolder, { recursive: true });
  }

  // Sanitize the original filename: remove unsafe characters and limit length
  const sanitizedOriginalName = file.name
    .replace(/[^a-zA-Z0-9-_.]/g, "_")
    .substring(0, 100);
  const fileExtWithDot = path.extname(sanitizedOriginalName);
  // Generate a unique filename to prevent collisions
  const uniqueFilename = `${randomUUID()}${fileExtWithDot}`;
  const filePath = path.join(uploadFolder, uniqueFilename).replace(/\\/g, "/");

  // Use sharp to resize the image, strip metadata, and convert to JPEG (optional)
  let processedBuffer;
  try {
    processedBuffer = await sharp(buffer)
      .resize({ width: 1024, withoutEnlargement: true }) // optional size normalization
      .removeAlpha() // ensure only 3 channels (RGB)
      .toFormat("jpeg", { mozjpeg: true })
      .toBuffer();
  } catch (err) {
    console.error("Image processing error:", err);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }

  // Save processed image to disk
  try {
    await sharp(processedBuffer).toFile(filePath);
  } catch (err) {
    console.error("Error saving file:", err);
    return NextResponse.json(
      { error: "Failed to save image" },
      { status: 500 }
    );
  }

  try {
    const { result, probability } = await runInference(filePath);

    const image = await prisma.image.create({
      data: {
        userId: parseInt(session.user.id),
        filePath: `/uploads/${uniqueFilename}`, // store relative path for public access
        result,
        probability,
      },
    });

    return NextResponse.json(
      {
        message: "Image processed",
        imageId: image.id,
        result,
        probability,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Inference error:", error);
    // Clean up file on failure
    await fsPromises.unlink(filePath).catch(() => {});
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
