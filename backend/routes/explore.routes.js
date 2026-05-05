// backend/src/routes/explore.routes.js
// backend/routes/explore.routes.js

const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const { toPublicUrl } = require("../utils/publicUrl");

const router = Router();
const prisma = new PrismaClient();

function normalizePost(req, post) {
  if (!post) return null;

  const normalizedImage = toPublicUrl(req, post.imageUrl || post.image_url);

  return {
    ...post,
    imageUrl: normalizedImage,
    image_url: normalizedImage,
    likes: post.likes ?? 0,
    saves: post.saves ?? 0,
    likesList: post.likesList || [],
    comments: post.comments || [],
    userId: post.userId || post.user_id,
    user_id: post.user_id || post.userId,
    user: post.user || {
      id: post.userId,
      name: "Usuario",
    },
    outfit: post.outfit
      ? {
          ...post.outfit,
          photos: (post.outfit.photos || []).map((photo) => ({
            ...photo,
            url: toPublicUrl(req, photo.url),
          })),
          items: (post.outfit.items || []).map((item) => ({
            ...item,
            prenda: item.prenda
              ? {
                  ...item.prenda,
                  imageUrl: toPublicUrl(
                    req,
                    item.prenda.imageUrl || item.prenda.image_url
                  ),
                  image_url: toPublicUrl(
                    req,
                    item.prenda.imageUrl || item.prenda.image_url
                  ),
                }
              : item.prenda,
          })),
        }
      : null,
  };
}

/**
 * GET /api/explore/outfits
 * Lista publicaciones de explorar.
 */
router.get("/outfits", async (req, res) => {
  try {
    const { style } = req.query;

    const where = {};

    if (style && String(style).trim() !== "") {
      where.style = {
        contains: String(style),
        mode: "insensitive",
      };
    }

    const posts = await prisma.explorePost.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        likesList: true,
        comments: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        outfit: {
          include: {
            photos: true,
            items: {
              include: {
                prenda: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      posts: posts.map((post) => normalizePost(req, post)),
    });
  } catch (error) {
    console.error("GET explore outfits error:", error);

    return res.status(500).json({
      error: "No se pudieron obtener las publicaciones",
      detail: error.message,
    });
  }
});

/**
 * POST /api/explore/outfits/:id/like
 * Da like o quita like.
 */
router.post("/outfits/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        error: "Falta userId",
      });
    }

    const post = await prisma.explorePost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada",
      });
    }

    const existingLike = await prisma.exploreLike.findFirst({
      where: {
        postId: id,
        userId,
      },
    });

    let liked = false;

    if (existingLike) {
      await prisma.exploreLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      await prisma.explorePost.update({
        where: { id },
        data: {
          likes: {
            decrement: post.likes > 0 ? 1 : 0,
          },
        },
      });

      liked = false;
    } else {
      await prisma.exploreLike.create({
        data: {
          postId: id,
          userId,
        },
      });

      await prisma.explorePost.update({
        where: { id },
        data: {
          likes: {
            increment: 1,
          },
        },
      });

      liked = true;
    }

    const updatedPost = await prisma.explorePost.findUnique({
      where: { id },
      include: {
        user: true,
        likesList: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        outfit: {
          include: {
            photos: true,
            items: {
              include: {
                prenda: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      liked,
      post: normalizePost(req, updatedPost),
    });
  } catch (error) {
    console.error("POST like error:", error);

    return res.status(500).json({
      error: "No se pudo actualizar el like",
      detail: error.message,
    });
  }
});

/**
 * POST /api/explore/outfits/:id/comments
 * Crea un comentario.
 */
router.post("/outfits/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, content } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        error: "Falta userId",
      });
    }

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        error: "El comentario no puede estar vacío",
      });
    }

    const post = await prisma.explorePost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada",
      });
    }

    const comment = await prisma.exploreComment.create({
      data: {
        postId: id,
        userId,
        content: String(content).trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Comentario agregado correctamente",
      comment,
    });
  } catch (error) {
    console.error("POST comment error:", error);

    return res.status(500).json({
      error: "No se pudo agregar el comentario",
      detail: error.message,
    });
  }
});

/**
 * PUT /api/explore/outfits/:id
 * Edita una publicación.
 */
router.put("/outfits/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, style } = req.body || {};

    const post = await prisma.explorePost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada",
      });
    }

    const updated = await prisma.explorePost.update({
      where: { id },
      data: {
        title: title ?? undefined,
        style: style ?? undefined,
      },
      include: {
        user: true,
        likesList: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        outfit: {
          include: {
            photos: true,
            items: {
              include: {
                prenda: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Publicación actualizada correctamente",
      post: normalizePost(req, updated),
    });
  } catch (error) {
    console.error("PUT explore post error:", error);

    return res.status(500).json({
      error: "No se pudo actualizar la publicación",
      detail: error.message,
    });
  }
});

/**
 * DELETE /api/explore/outfits/:id
 * Elimina una publicación.
 */
router.delete("/outfits/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.explorePost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada",
      });
    }

    await prisma.explorePost.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Publicación eliminada correctamente",
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE explore post error:", error);

    return res.status(500).json({
      error: "No se pudo eliminar la publicación",
      detail: error.message,
    });
  }
});

module.exports = router;