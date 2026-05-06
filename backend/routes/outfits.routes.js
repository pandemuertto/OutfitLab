// backend/routes/outfits.routes.js
/// backend/routes/outfits.routes.js

const { Router } = require("express");
const path = require("path");
const fs = require("fs").promises;
const { PrismaClient } = require("@prisma/client");
const upload = require("../lib/multer");
const { uploadLocalFileToSupabase } = require("../services/supabaseStorage.service");

const prisma = new PrismaClient();
const router = Router();

/* =========================================================
   HELPERS
========================================================= */

function safeLower(value) {
  return String(value || "").toLowerCase().trim();
}

function normalizeWeather(value) {
  const weather = safeLower(value);

  if (["sunny", "soleado", "calor"].includes(weather)) return "sunny";
  if (["cloudy", "nublado"].includes(weather)) return "cloudy";
  if (["cold", "frio", "frío"].includes(weather)) return "cold";
  if (["rainy", "lluvioso", "lluvia"].includes(weather)) return "rainy";

  return weather;
}

function normalizeOccasion(value) {
  const occasion = safeLower(value);

  if (["casual"].includes(occasion)) return "casual";
  if (["trabajo", "oficina", "work"].includes(occasion)) return "trabajo";
  if (["fiesta", "party"].includes(occasion)) return "fiesta";
  if (["romantico", "romántico", "date"].includes(occasion)) return "romantico";
  if (["deportivo", "sport", "gym"].includes(occasion)) return "deportivo";

  return occasion;
}

function normalizeDressCode(value) {
  const style = safeLower(value);

  if (["moderno"].includes(style)) return "moderno";
  if (["clasico", "clásico"].includes(style)) return "clasico";
  if (["boho"].includes(style)) return "boho";
  if (["minimal", "minimalista"].includes(style)) return "minimal";
  if (["elegante", "formal", "chic"].includes(style)) return "elegante";

  return style;
}

function isAbsoluteUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

function buildFullUrl(req, url) {
  if (!url) return null;
  if (isAbsoluteUrl(url)) return url;

  const base =
    process.env.PUBLIC_BACKEND_URL ||
    process.env.BACKEND_PUBLIC_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `${req.protocol}://${req.get("host")}`;

  const cleanBase = String(base).replace(/\/$/, "");
  const cleanPath = String(url).startsWith("/") ? String(url) : `/${url}`;

  return `${cleanBase}${cleanPath}`;
}

async function safeDeleteLocalFile(localPath) {
  try {
    if (localPath) await fs.unlink(localPath);
  } catch (e) {
    console.warn("No se pudo borrar archivo temporal:", e.message);
  }
}

function groupClothesByCategory(clothes) {
  return {
    tops: clothes.filter((c) => c.category === "top"),
    bottoms: clothes.filter((c) => c.category === "bottom"),
    dresses: clothes.filter((c) => c.category === "dress"),
    outerwear: clothes.filter((c) => c.category === "outerwear"),
    shoes: clothes.filter((c) => c.category === "shoes"),
    accessories: clothes.filter((c) => c.category === "accessory"),
    others: clothes.filter((c) => !c.category || c.category === "other"),
  };
}

function colorCompatibilityScore(a, b) {
  const colorA = safeLower(a?.color);
  const colorB = safeLower(b?.color);

  if (!colorA || !colorB) return 2;
  if (colorA === colorB) return 7;

  const neutrals = [
    "negro",
    "blanco",
    "gris",
    "beige",
    "crema",
    "khaki",
    "cafe",
    "café",
    "brown",
  ];

  if (
    neutrals.some((n) => colorA.includes(n)) ||
    neutrals.some((n) => colorB.includes(n))
  ) {
    return 5;
  }

  const pairs = [
    ["azul", "blanco"],
    ["gris", "negro"],
    ["rosa", "blanco"],
    ["beige", "negro"],
    ["vino", "negro"],
    ["rojo", "negro"],
    ["azul", "gris"],
    ["verde", "beige"],
  ];

  const matches = pairs.some(
    ([x, y]) =>
      (colorA.includes(x) && colorB.includes(y)) ||
      (colorA.includes(y) && colorB.includes(x))
  );

  return matches ? 4 : 1;
}

function sumPairColorScore(pieces) {
  let score = 0;

  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      score += colorCompatibilityScore(pieces[i], pieces[j]);
    }
  }

  return score;
}

function scoreClothing(item, context) {
  let score = 0;

  const type = safeLower(item.type);
  const category = safeLower(item.category);
  const color = safeLower(item.color);
  const occasion = normalizeOccasion(context.occasion);
  const weather = normalizeWeather(context.weather);
  const style = normalizeDressCode(context.dressCode);

  if (typeof item.confidence === "number") score += item.confidence * 10;
  else score += 3;

  if (category === "other") score -= 8;

  if (occasion === "casual") {
    if (["top", "bottom", "shoes"].includes(category)) score += 8;
    if (
      ["t-shirt", "shirt", "blouse", "jeans", "pants", "shorts", "shoe"].includes(
        type
      )
    ) {
      score += 8;
    }
    if (["hat", "bag"].includes(type)) score += 2;
  }

  if (occasion === "trabajo") {
    if (
      [
        "shirt",
        "blouse",
        "pants",
        "trousers",
        "jacket",
        "blazer",
        "dress",
        "shoe",
      ].includes(type)
    ) {
      score += 12;
    }
    if (category === "outerwear") score += 6;
    if (["hoodie", "shorts", "hat"].includes(type)) score -= 10;
  }

  if (occasion === "fiesta") {
    if (["dress", "blouse", "skirt", "shoe", "bag"].includes(type)) score += 12;
    if (category === "accessory") score += 4;
    if (["hoodie"].includes(type)) score -= 8;
  }

  if (occasion === "romantico") {
    if (["dress", "blouse", "skirt", "shoe", "bag"].includes(type)) score += 11;
    if (category === "accessory") score += 4;
  }

  if (occasion === "deportivo") {
    if (["hoodie", "t-shirt", "shorts", "shoe"].includes(type)) score += 12;
    if (["dress", "blazer", "bag"].includes(type)) score -= 8;
  }

  if (weather === "sunny") {
    if (["dress", "t-shirt", "shirt", "blouse", "shorts", "skirt"].includes(type)) {
      score += 7;
    }
    if (["jacket", "coat", "outerwear"].includes(type)) score -= 8;
  }

  if (weather === "cloudy") {
    if (["jacket", "cardigan", "outerwear"].includes(type)) score += 5;
  }

  if (weather === "cold") {
    if (["jacket", "coat", "outerwear", "hoodie"].includes(type)) score += 13;
    if (["shorts", "skirt"].includes(type)) score -= 10;
  }

  if (weather === "rainy") {
    if (["jacket", "coat", "outerwear", "shoe"].includes(type)) score += 10;
    if (["shorts"].includes(type)) score -= 7;
  }

  if (style === "minimal") {
    if (["shirt", "blouse", "pants", "dress", "jacket", "shoe"].includes(type)) {
      score += 5;
    }
    if (["hat"].includes(type)) score -= 2;
  }

  if (style === "boho") {
    if (["dress", "skirt", "bag", "hat", "blouse"].includes(type)) score += 6;
  }

  if (style === "clasico") {
    if (["shirt", "blouse", "pants", "jacket", "dress"].includes(type)) score += 5;
  }

  if (style === "elegante") {
    if (["dress", "blouse", "jacket", "shoe", "bag"].includes(type)) score += 6;
  }

  if (style === "moderno") {
    if (["jacket", "dress", "pants", "shoe"].includes(type)) score += 4;
  }

  if (
    Array.isArray(context.favoriteColors) &&
    context.favoriteColors.includes(color)
  ) {
    score += 5;
  }

  if (
    Array.isArray(context.dislikedColors) &&
    context.dislikedColors.includes(color)
  ) {
    score -= 6;
  }

  return score;
}

function dedupeById(items) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }

  return result;
}

function addBestOptionalPieces(basePieces, grouped, context) {
  const weather = normalizeWeather(context.weather);
  const occasion = normalizeOccasion(context.occasion);
  const style = normalizeDressCode(context.dressCode);

  const pieces = [...basePieces];
  const usedIds = new Set(basePieces.map((p) => p.id));

  const scoredOuterwear = grouped.outerwear
    .filter((item) => !usedIds.has(item.id))
    .map((item) => ({ ...item, _score: scoreClothing(item, context) }))
    .sort((a, b) => b._score - a._score);

  const scoredAccessories = grouped.accessories
    .filter((item) => !usedIds.has(item.id))
    .map((item) => ({ ...item, _score: scoreClothing(item, context) }))
    .sort((a, b) => b._score - a._score);

  if (["cold", "rainy", "cloudy"].includes(weather) && scoredOuterwear.length) {
    pieces.push(scoredOuterwear[0]);
    usedIds.add(scoredOuterwear[0].id);
  }

  const shouldAddAccessory =
    ["fiesta", "romantico"].includes(occasion) ||
    ["boho", "elegante"].includes(style);

  if (shouldAddAccessory && scoredAccessories.length) {
    const bestAccessory = scoredAccessories.find((a) => !usedIds.has(a.id));

    if (bestAccessory) {
      pieces.push(bestAccessory);
      usedIds.add(bestAccessory.id);
    }
  }

  return dedupeById(pieces);
}

function explainOutfit(outfit, context) {
  const occasion = normalizeOccasion(context.occasion);
  const weather = normalizeWeather(context.weather);
  const style = normalizeDressCode(context.dressCode);

  const pieces = outfit.pieces || [];
  const hasOuterwear = pieces.some((p) => p.category === "outerwear");
  const hasAccessory = pieces.some((p) => p.category === "accessory");

  const reasons = [];

  if (occasion) reasons.push(`pensado para una ocasión ${occasion}`);
  if (style) reasons.push(`con una vibra ${style}`);
  if (weather) reasons.push(`adaptado a clima ${weather}`);
  if (hasOuterwear) reasons.push("incluye una capa extra");
  if (hasAccessory) reasons.push("añade un accesorio para completar el look");

  return reasons.join(", ") + ".";
}

function normalizePieceForResponse(piece, req) {
  const imageUrl = buildFullUrl(req, piece.imageUrl);

  return {
    id: piece.id,
    imageUrl,
    type: piece.type,
    category: piece.category,
    color: piece.color,
    brand: piece.brand,
    confidence: piece.confidence,
  };
}

function normalizeOutfitForResponse(req, outfit) {
  const latestPhoto = outfit.photos?.length
    ? outfit.photos[outfit.photos.length - 1]
    : null;

  const photoUrl = latestPhoto ? buildFullUrl(req, latestPhoto.url) : null;

  return {
    ...outfit,
    photoUrl,
    items: (outfit.items || []).map((item) => ({
      ...item,
      prenda: item.prenda
        ? {
            ...item.prenda,
            imageUrl: buildFullUrl(req, item.prenda.imageUrl),
          }
        : item.prenda,
    })),
    photos: (outfit.photos || []).map((photo) => ({
      ...photo,
      url: buildFullUrl(req, photo.url),
    })),
  };
}

function buildOutfitOptions(grouped, context, req) {
  const scored = {
    tops: grouped.tops
      .map((item) => ({ ...item, _score: scoreClothing(item, context) }))
      .sort((a, b) => b._score - a._score),

    bottoms: grouped.bottoms
      .map((item) => ({ ...item, _score: scoreClothing(item, context) }))
      .sort((a, b) => b._score - a._score),

    dresses: grouped.dresses
      .map((item) => ({ ...item, _score: scoreClothing(item, context) }))
      .sort((a, b) => b._score - a._score),

    shoes: grouped.shoes
      .map((item) => ({ ...item, _score: scoreClothing(item, context) }))
      .sort((a, b) => b._score - a._score),
  };

  const outfitCandidates = [];

  if (scored.dresses.length) {
    const maxShoes = Math.min(2, scored.shoes.length || 1);

    for (let i = 0; i < Math.min(3, scored.dresses.length); i++) {
      if (scored.shoes.length) {
        for (let j = 0; j < maxShoes; j++) {
          const basePieces = [scored.dresses[i], scored.shoes[j]];
          const fullPieces = addBestOptionalPieces(basePieces, grouped, context);

          const score =
            fullPieces.reduce((acc, p) => acc + (p._score || 0), 0) +
            sumPairColorScore(fullPieces);

          outfitCandidates.push({
            type: "dress",
            score,
            pieces: dedupeById(fullPieces),
          });
        }
      } else {
        const basePieces = [scored.dresses[i]];
        const fullPieces = addBestOptionalPieces(basePieces, grouped, context);

        const score =
          fullPieces.reduce((acc, p) => acc + (p._score || 0), 0) +
          sumPairColorScore(fullPieces);

        outfitCandidates.push({
          type: "dress",
          score,
          pieces: dedupeById(fullPieces),
        });
      }
    }
  }

  if (scored.tops.length && scored.bottoms.length) {
    const topLimit = Math.min(3, scored.tops.length);
    const bottomLimit = Math.min(3, scored.bottoms.length);
    const shoeLimit = Math.min(2, scored.shoes.length || 1);

    for (let i = 0; i < topLimit; i++) {
      for (let j = 0; j < bottomLimit; j++) {
        if (scored.tops[i].id === scored.bottoms[j].id) continue;

        if (scored.shoes.length) {
          for (let k = 0; k < shoeLimit; k++) {
            const shoe = scored.shoes[k];

            if ([scored.tops[i].id, scored.bottoms[j].id].includes(shoe.id)) {
              continue;
            }

            const basePieces = [scored.tops[i], scored.bottoms[j], shoe];
            const fullPieces = addBestOptionalPieces(basePieces, grouped, context);

            const score =
              fullPieces.reduce((acc, p) => acc + (p._score || 0), 0) +
              sumPairColorScore(fullPieces);

            outfitCandidates.push({
              type: "separates",
              score,
              pieces: dedupeById(fullPieces),
            });
          }
        } else {
          const basePieces = [scored.tops[i], scored.bottoms[j]];
          const fullPieces = addBestOptionalPieces(basePieces, grouped, context);

          const score =
            fullPieces.reduce((acc, p) => acc + (p._score || 0), 0) +
            sumPairColorScore(fullPieces);

          outfitCandidates.push({
            type: "separates",
            score,
            pieces: dedupeById(fullPieces),
          });
        }
      }
    }
  }

  const unique = [];
  const seen = new Set();

  for (const outfit of outfitCandidates.sort((a, b) => b.score - a.score)) {
    const key = outfit.pieces
      .map((p) => p.id)
      .sort((a, b) => a - b)
      .join("-");

    if (seen.has(key)) continue;
    seen.add(key);

    unique.push({
      type: outfit.type,
      score: Math.round(outfit.score * 100) / 100,
      reason: explainOutfit(outfit, context),
      pieces: outfit.pieces.map((p) => normalizePieceForResponse(p, req)),
    });
  }

  return unique.slice(0, 5);
}

/* =========================================================
   ROUTES
========================================================= */

router.post("/generate", async (req, res) => {
  try {
    const {
      userId,
      occasion,
      weather,
      dressCode,
      favoriteColors = [],
      dislikedColors = [],
    } = req.body;

    if (!userId || !occasion || !weather) {
      return res.status(400).json({
        error: "Faltan datos para generar outfits",
        required: ["userId", "occasion", "weather"],
      });
    }

    const clothes = await prisma.prenda.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!clothes.length) {
      return res.status(404).json({
        error: "El usuario no tiene prendas guardadas",
      });
    }

    const grouped = groupClothesByCategory(clothes);

    const outfits = buildOutfitOptions(
      grouped,
      {
        occasion,
        weather,
        dressCode,
        favoriteColors: favoriteColors.map(safeLower),
        dislikedColors: dislikedColors.map(safeLower),
      },
      req
    );

    return res.json({
      success: true,
      count: outfits.length,
      outfits,
    });
  } catch (error) {
    console.error("generate outfit error:", error);

    return res.status(500).json({
      error: "No se pudieron generar outfits",
      detail: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      name,
      occasion,
      dressCode,
      weather,
      collectionId,
      itemIds,
      prendaIds,
    } = req.body;

    const idsRaw =
      Array.isArray(itemIds) && itemIds.length ? itemIds : prendaIds;

    const ids = Array.isArray(idsRaw)
      ? [
          ...new Set(
            idsRaw.map((id) => Number(id)).filter((id) => Number.isInteger(id))
          ),
        ]
      : [];

    if (!userId || !ids.length) {
      return res.status(400).json({
        error: "Faltan datos para guardar el outfit",
      });
    }

    const prendas = await prisma.prenda.findMany({
      where: {
        userId,
        id: { in: ids },
      },
    });

    if (!prendas.length) {
      return res.status(404).json({
        error: "No se encontraron prendas válidas para guardar el outfit",
      });
    }

    const outfit = await prisma.outfit.create({
      data: {
        userId,
        name: name || "Outfit sugerido",
        occasion: occasion || null,
        dressCode: dressCode || null,
        weather: weather || null,
        collectionId: collectionId || null,
        items: {
          create: prendas.map((prenda) => ({
            prendaId: prenda.id,
          })),
        },
      },
      include: {
        items: {
          include: {
            prenda: true,
          },
        },
        collection: true,
        photos: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Outfit guardado correctamente",
      outfit: normalizeOutfitForResponse(req, outfit),
    });
  } catch (error) {
    console.error("save outfit error:", error);

    return res.status(500).json({
      error: "No se pudo guardar el outfit",
      detail: error.message,
    });
  }
});

/**
 * El front manda el archivo en el campo "image".
 * Aquí ya NO guardamos /uploads en BD.
 * Subimos la foto del outfit a Supabase Storage y guardamos la URL pública.
 */
router.post("/:id/photo", upload.single("image"), async (req, res) => {
  const tempPhotoPath = req.file
    ? path.join(__dirname, "..", "uploads", req.file.filename)
    : null;

  try {
    const { id } = req.params;
    const { publishToExplore, postTitle } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Falta archivo image" });
    }

    const outfit = await prisma.outfit.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            prenda: true,
          },
        },
        photos: true,
      },
    });

    if (!outfit) {
      return res.status(404).json({ error: "Outfit no encontrado" });
    }

    const uploaded = await uploadLocalFileToSupabase({
      localPath: tempPhotoPath,
      folder: "outfits/photos",
      userId: outfit.userId,
      fileName: req.file.originalname || req.file.filename,
    });

    const publicUrl = uploaded.publicUrl;

    console.log("[OUTFITS] foto subida a Supabase:", publicUrl);

    const photo = await prisma.outfitPhoto.create({
      data: {
        outfitId: id,
        url: publicUrl,
      },
    });

    let explorePost = null;

    if (String(publishToExplore) === "true") {
      explorePost = await prisma.explorePost.create({
        data: {
          outfitId: outfit.id,
          userId: outfit.userId,
          title: postTitle || outfit.name || "Outfit sugerido",
          imageUrl: publicUrl,
          style: outfit.occasion || null,
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
    }

    return res.status(201).json({
      success: true,
      message:
        String(publishToExplore) === "true"
          ? "Foto guardada y outfit publicado en Explorar"
          : "Foto guardada correctamente",
      photo: {
        ...photo,
        url: publicUrl,
      },
      explorePost: explorePost
        ? {
            ...explorePost,
            imageUrl: buildFullUrl(req, explorePost.imageUrl),
          }
        : null,
    });
  } catch (error) {
    console.error("upload outfit photo error:", error);

    return res.status(500).json({
      error: "No se pudo subir la foto del outfit",
      detail: error.message,
    });
  } finally {
    await safeDeleteLocalFile(tempPhotoPath);
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const outfits = await prisma.outfit.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" },
      include: {
        collection: true,
        items: {
          include: {
            prenda: true,
          },
        },
        photos: true,
      },
    });

    const normalized = outfits.map((outfit) =>
      normalizeOutfitForResponse(req, outfit)
    );

    return res.json(normalized);
  } catch (error) {
    console.error("list outfits error:", error);

    return res.status(500).json({
      error: "No se pudieron obtener los outfits",
      detail: error.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, occasion, dressCode, weather, collectionId } = req.body;

    const outfit = await prisma.outfit.update({
      where: { id },
      data: {
        name: name ?? undefined,
        occasion: occasion ?? undefined,
        dressCode: dressCode ?? undefined,
        weather: weather ?? undefined,
        collectionId: collectionId ?? undefined,
      },
      include: {
        items: {
          include: {
            prenda: true,
          },
        },
        collection: true,
        photos: true,
      },
    });

    return res.json({
      success: true,
      message: "Outfit actualizado correctamente",
      outfit: normalizeOutfitForResponse(req, outfit),
    });
  } catch (error) {
    console.error("update outfit error:", error);

    return res.status(500).json({
      error: "No se pudo actualizar el outfit",
      detail: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.outfit.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Outfit eliminado correctamente",
    });
  } catch (error) {
    console.error("delete outfit error:", error);

    return res.status(500).json({
      error: "No se pudo eliminar el outfit",
      detail: error.message,
    });
  }
});

module.exports = router;