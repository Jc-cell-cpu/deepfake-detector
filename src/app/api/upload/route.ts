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
import logger from "@/lib/logger";

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

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload and process an image for deepfake detection
 *     description: Uploads an image, processes it, runs deepfake detection inference, and saves the result. Requires authentication.
 *     tags: [Image Management]
 *     security:
 *       - BasicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, or WebP, max 10MB)
 *     responses:
 *       200:
 *         description: Image processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image processed"
 *                 imageId:
 *                   type: integer
 *                 result:
 *                   type: string
 *                   example: "Real"
 *                 probability:
 *                   type: number
 *                   example: 0.95
 *       400:
 *         description: Invalid file type, size, or malware detected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid file type. Only JPEG, PNG, and WebP are allowed."
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Rate limit exceeded. Try again later."
 *       500:
 *         description: Failed to process image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to process image"
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  logger.info("Processing image upload", { userId: session?.user?.id });

  if (!session?.user?.id) {
    logger.warn("Unauthorized access attempt to upload endpoint");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting check
  if (!checkRateLimit(session.user.id)) {
    logger.warn("Rate limit exceeded", { userId: session.user.id });
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    logger.warn("No file uploaded", { userId: session.user.id });
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Validate file type and file size
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  logger.debug("Validating file", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });
  if (!ALLOWED_TYPES.includes(file.type)) {
    logger.warn("Invalid file type", {
      fileType: file.type,
      userId: session.user.id,
    });
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    logger.warn("File size exceeds limit", {
      fileSize: file.size,
      userId: session.user.id,
    });
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
  logger.debug("Checking file signature", {
    fileExt: fileExtOriginal,
    signature: magicStart,
  });
  if (isDangerous) {
    logger.warn("Blocked potential malware", {
      signature: magicStart,
      userId: session.user.id,
    });
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
      logger.warn("Unusual image signature detected", {
        signature: magicStart,
        fileExt: fileExtOriginal,
        userId: session.user.id,
      });
    }
  }

  // Create uploads folder if it doesn't exist
  const uploadFolder = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadFolder)) {
    logger.info("Creating uploads folder", { path: uploadFolder });
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
    logger.debug("Processing image with sharp", { fileName: uniqueFilename });
    processedBuffer = await sharp(buffer)
      .resize({ width: 1024, withoutEnlargement: true }) // optional size normalization
      .removeAlpha() // ensure only 3 channels (RGB)
      .toFormat("jpeg", { mozjpeg: true })
      .toBuffer();
  } catch (err) {
    logger.error("Image processing error", {
      userId: session.user.id,
      fileName: file.name,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }

  // Save processed image to disk
  try {
    logger.debug("Saving processed image", { filePath });
    await sharp(processedBuffer).toFile(filePath);
  } catch (err) {
    logger.error("Error saving file", {
      userId: session.user.id,
      filePath,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to save image" },
      { status: 500 }
    );
  }

  try {
    logger.info("Running inference on image", {
      filePath,
      userId: session.user.id,
    });
    const { result, probability } = await runInference(filePath);

    logger.debug("Saving image record to database", {
      filePath,
      userId: session.user.id,
    });
    const image = await prisma.image.create({
      data: {
        userId: parseInt(session.user.id),
        filePath: `/uploads/${uniqueFilename}`, // store relative path for public access
        result,
        probability,
      },
    });

    logger.info("Image processed successfully", {
      imageId: image.id,
      result,
      probability,
      userId: session.user.id,
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
    logger.error("Inference error", {
      userId: session.user.id,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    // Clean up file on failure
    await fsPromises.unlink(filePath).catch((err) => {
      logger.error("Error cleaning up file", {
        filePath,
        error: err instanceof Error ? err.message : String(err),
      });
    });
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
