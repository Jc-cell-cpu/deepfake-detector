import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import logger from "@/lib/logger";

/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: Delete an image by ID
 *     description: Deletes an image belonging to the authenticated user. The user must be the owner of the image.
 *     tags: [Image Management]
 *     security:
 *       - BasicAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the image to delete
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image deleted successfully"
 *       400:
 *         description: Invalid image ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid image ID"
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
 *       403:
 *         description: Forbidden - User is not the owner of the image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Image not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    logger.info("Attempting to delete image", { userId: session?.user?.id });

    if (!session?.user?.id) {
      logger.warn("Unauthorized access attempt to delete image");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params to resolve the dynamic id
    const { id } = await context.params;

    const imageId = parseInt(id);

    if (isNaN(imageId)) {
      logger.warn("Invalid image ID provided", { id });
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
    }

    logger.debug("Looking up image", { imageId, userId: session.user.id });

    const image = await prisma.image.findUnique({
      where: {
        id: imageId,
      },
    });

    if (!image) {
      logger.warn("Image not found", { imageId });
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.userId !== parseInt(session.user.id)) {
      logger.warn("Forbidden access attempt to delete image", {
        imageId,
        userId: session.user.id,
        imageOwner: image.userId,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.image.delete({
      where: {
        id: imageId,
      },
    });

    logger.info("Image deleted successfully", {
      imageId,
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    logger.error("Failed to delete image", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
