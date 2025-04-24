import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import logger from "@/lib/logger";

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: Retrieve paginated images for the authenticated user
 *     description: Fetches a paginated list of images uploaded by the authenticated user. Requires a valid session.
 *     tags: [Image Management]
 *     security:
 *       - BasicAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination (default is 1)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page (default is 10)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved images
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       url:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid pagination parameters"
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
 *       500:
 *         description: Failed to fetch images
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch images"
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  logger.info("Fetching images for user", { userId: session?.user?.id });

  if (!session?.user?.id) {
    logger.warn("Unauthorized access attempt to images endpoint");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // Optional pagination parameters with defaults
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    logger.warn("Invalid pagination parameters", { page, limit });
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
      { status: 400 }
    );
  }

  try {
    // Only use authenticated user's ID to query
    const userId = parseInt(session.user.id);

    logger.debug("Querying images for user", { userId, page, limit, skip });

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

    logger.info("Successfully fetched images", {
      userId,
      total,
      page,
      limit,
    });

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
    logger.error("Failed to fetch images", {
      userId: session?.user?.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
