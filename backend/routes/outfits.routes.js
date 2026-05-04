// backend/routes/outfits.routes.js
const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const upload = require("../lib/multer");

const prisma = new PrismaClient();
const router = Router();

function safeLower(value) {
  return String(value || "").toLowerCase().trim();
}

function normalizeWeather(value) {
  const weather = safeLower(value);

  const map = {
    sunny: "soleado",
    sun: "soleado",
    soleado: "soleado",

    cloudy: "nublado",
    cloud: "nublado",
    nublado: "nublado",

    cold: "frio",
    frío: "frio",
    frio: "frio",

    rainy: "lluvia",
    rain: "lluvia",
    lluvioso: "lluvia",
    lluvia: "lluvia",
  };

  return map[weather] || weather;
}

function groupClothesByCategory(clothes) {
  return {
    tops: clothes.filter((c) => c.category === "top"),
    bottoms: clothes.filter((c) => c.category === "bottom"),
    dresses: clothes.filter((c) => c.category === "dress"),
    outerwear: clothes.filter((c) => c.category === "outerwear"),
    shoes: clothes.filter((c) => c.category === "shoes"),
    accessories: clothes.filter((c) => c.category === "accessory"),
    others: clothes.filter((c) => c.category === "other" || !c.category),
  };
}

function scoreClothing(item, context) {
  let score = 0;

  const type = safeLower(item.type);
  const category = safeLower(item.category);
  const color = safeLower(item.color);
  const occasion = safeLower(context.occasion);
  const weather = normalizeWeather(context.weather);

  if (typeof item.confidence === "number") {
    score += item.confidence * 10;
  } else {
    score += 3;
  }

  if (occasion === "casual") {
    if (["top", "bottom", "shoes"].includes(category)) score += 8;
    if (["t-shirt", "shirt", "blouse", "jeans", "pants", "shoe"].includes(type)) score += 10;
    if (["blazer", "heel"].includes(type)) score -= 3;
  }

  if (occasion === "trabajo") {
    if (
      ["shirt", "blouse", "trousers", "pants", "blazer", "coat", "jacket", "heel", "shoe"].includes(type)
    ) {
      score += 14;
    }
    if (category === "outerwear") score += 8;
    if (["hoodie", "shorts"].includes(type)) score -= 10;
  }

  if (occasion === "fiesta") {
    if (["dress", "skirt", "blouse", "heel", "shoe"].includes(type)) score += 14;
    if (category === "accessory") score += 6;
  }

  if (occasion === "romantico") {
    if (["dress", "skirt", "blouse", "heel", "shoe"].includes(type)) score += 13;
    if (category === "accessory") score += 5;
  }

  if (occasion === "deportivo") {
    if (["t-shirt", "shorts", "shoe", "hoodie"].includes(type)) score += 14;
    if (["blazer", "coat", "heel"].includes(type)) score -= 10;
  }

  if (weather === "soleado") {
    if (["dress", "t-shirt", "shirt", "blouse", "shorts", "skirt"].includes(type)) score += 8;
    if (["coat", "jacket", "blazer", "outerwear"].includes(type)) score -= 8;
  }

  if (weather === "nublado") {
    if (["jacket", "cardigan", "outerwear", "blazer"].includes(type)) score += 6;
  }

  if (weather === "frio") {
    if (["coat", "jacket", "cardigan", "blazer", "outerwear"].includes(type)) score += 14;
    if (["shorts"].includes(type)) score -= 12;
  }

  if (weather === "lluvia") {
    if (["coat", "jacket", "outerwear", "shoe"].includes(type)) score += 12;
    if (["shorts", "heel"].includes(type)) score -= 4;
  }

  if (Array.isArray(context.favoriteColors) && context.favoriteColors.includes(color)) {
    score += 6;
  }

  if (Array.isArray(context.dislikedColors) && context.dislikedColors.includes(color)) {
    score -= 6;
  }

  return score;
}

function colorCompatibilityScore(a, b) {
  const colorA = safeLower(a?.color);
  const colorB = safeLower(b?.color);

  if (!colorA || !colorB) return 2;
  if (colorA === colorB) return 8;

  const neutrals = ["negro", "blanco", "beige", "gris", "cafe", "brown", "cream", "khaki"];
  if (neutrals.includes(colorA) || neutrals.includes(colorB)) return 6;

  const softPairs = [
    ["azul", "blanco"],
    ["rosa", "blanco"],
    ["beige", "negro"],
    ["gris", "negro"],
    ["azul", "gris"],
  ];

  const match = softPairs.some(
    ([x, y]) =>
      (colorA.includes(x) && colorB.includes(y)) ||
      (colorA.includes(y) && colorB.includes(x))
  );

  if (match) return 5;

  return 1;
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

function addOptionalPieces(basePieces, grouped, context) {
  const weather = normalizeWeather(context.weather);

  const scoredOuterwear = grouped.outerwear
    .map((item) => ({ ...item, _score: scoreClothing(item, context) }))
    .sort((a, b) => b._score - a._score);

  const scoredAccessories = grouped.accessories
    .map((item) => ({ ...item, _score: scoreClothing(item, context) }))
    .sort((a, b) => b._score - a._score);

  const pieces = [...basePieces];

  if (["frio", "lluvia", "nublado"].includes(weather) && scoredOuterwear.length) {
    pieces.push(scoredOuterwear[0]);
  }

  if (scoredAccessories.length) {
    pieces.push(scoredAccessories[0]);
  }

  return pieces;
}

function explainOutfit(outfit, context) {
  const weather = normalizeWeather(context.weather);
  const occasion = safeLower(context.occasion);

  const hasOuterwear = outfit.pieces.some((p) => p.category === "outerwear");
  const hasAccessory = outfit.pieces.some((p) => p.category === "accessory");
  const dominantTypes = outfit.pieces.map((p) => p.type).filter(Boolean).slice(0, 3);

  const parts = [];

  if (occasion) parts.push(`pensado para una ocasión ${occasion}`);
  if (weather) parts.push(`adecuado para clima ${weather}`);
  if (hasOuterwear) parts.push("incluye una capa extra para mayor comodidad");
  if (hasAccessory) parts.push("añade un accesorio para completar el look");
  if (dominantTypes.length) parts.push(`usa piezas como ${dominantTypes.join(", ")}`);

  return parts.join(", ") + ".";
}

function normalizePieceForResponse(piece, base) {
  const imageUrl = piece.imageUrl?.startsWith("http")
    ? piece.imageUrl
    : `${base}${piece.imageUrl}`;

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

function buildOutfitOptions(grouped, context, base) {
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

  const outfits = [];

  if (scored.dresses.length && scored.shoes.length) {
    const basePieces = [scored.dresses[0], scored.shoes[0]];
    const fullPieces = addOptionalPieces(basePieces, grouped, context);
    const score =
      fullPieces.reduce((acc, p) => acc + (p._score || 0), 0) +
      sumPairColorScore(fullPieces);

    outfits.push({
      type: "dress",
      score,
      pieces: fullPieces,
    });
  }

  if (scored.tops.length && scored.bottoms.length && scored.shoes.length) {
    const combos = [];

    for (let i = 0; i < Math.min(3, scored.tops.length); i++) {
      for (let j = 0; j < Math.min(3, scored.bottoms.length); j++) {
        for (let k = 0; k < Math.min(2, scored.shoes.length); k++) {
          const basePieces = [scored.tops[i], scored.bottoms[j], scored.shoes[k]];
          const fullPieces = addOptionalPieces(basePieces, grouped, context);

          const score =
            fullPieces.reduce((acc, p) => acc + (p._score || 0), 0) +
            sumPairColorScore(fullPieces);

          combos.push({
            type: "separates",
            score,
            pieces: fullPieces,
          });
        }
      }
    }

    combos.sort((a, b) => b.score - a.score);
    outfits.push(...combos.slice(0, 4));
  }

  const unique = [];
  const seen = new Set();

  for (const outfit of outfits.sort((a, b) => b.score - a.score)) {
    const key = outfit.pieces
      .map((p) => p.id)
      .sort((a, b) => a - b)
      .join("-");

    if (!seen.has(key)) {
      seen.add(key);

      const normalizedPieces = outfit.pieces.map((p) =>
        normalizePieceForResponse(p, base)
      );

      unique.push({
        type: outfit.type,
        score: outfit.score,
        reason: explainOutfit(outfit, context),
        pieces: normalizedPieces,
        items: normalizedPieces,
      });
    }
  }

  return unique.slice(0, 3);
}

router.post("/generate", async (req, res) => {
  try {
    const {
      userId,
      occasion,
      weather,
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
    const base = `${req.protocol}://${req.get("host")}`;

    const outfits = buildOutfitOptions(
      grouped,
      {
        occasion,
        weather,
        favoriteColors: favoriteColors.map(safeLower),
        dislikedColors: dislikedColors.map(safeLower),
      },
      base
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
      prendaIds,
      itemIds,
    } = req.body;

    const rawIds = Array.isArray(prendaIds) ? prendaIds : itemIds;

    const ids = Array.isArray(rawIds)
      ? rawIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      : [];

    if (!userId || ids.length === 0) {
      return res.status(400).json({
        error: "Faltan datos para guardar el outfit",
        received: {
          userId,
          prendaIds,
          itemIds,
        },
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
      outfit,
    });
  } catch (error) {
    console.error("save outfit error:", error);
    return res.status(500).json({
      error: "No se pudo guardar el outfit",
      detail: error.message,
    });
  }
});

router.post("/:id/photo", upload.single("image"), async (req, res) => {
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
      },
    });

    if (!outfit) {
      return res.status(404).json({ error: "Outfit no encontrado" });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;

    const photo = await prisma.outfitPhoto.create({
      data: {
        outfitId: id,
        url: relativeUrl,
      },
    });

    let explorePost = null;

    if (String(publishToExplore) === "true") {
      explorePost = await prisma.explorePost.create({
        data: {
          outfitId: outfit.id,
          userId: outfit.userId,
          title: postTitle || outfit.name || "Outfit sugerido",
          imageUrl: relativeUrl,
          style: outfit.occasion || null,
        },
      });
    }

    const base = `${req.protocol}://${req.get("host")}`;

    return res.status(201).json({
      success: true,
      message:
        String(publishToExplore) === "true"
          ? "Foto guardada y outfit publicado en Explorar"
          : "Foto guardada correctamente",
      photo: {
        ...photo,
        url: photo.url.startsWith("http") ? photo.url : `${base}${photo.url}`,
      },
      explorePost,
    });
  } catch (error) {
    console.error("upload outfit photo error:", error);
    return res.status(500).json({
      error: "No se pudo subir la foto del outfit",
      detail: error.message,
    });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const base = `${req.protocol}://${req.get("host")}`;

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

    const normalized = outfits.map((outfit) => ({
      ...outfit,
      photoUrl: outfit.photos?.[0]?.url
        ? outfit.photos[0].url.startsWith("http")
          ? outfit.photos[0].url
          : `${base}${outfit.photos[0].url}`
        : null,
      items: outfit.items.map((item) => ({
        ...item,
        prenda: {
          ...item.prenda,
          imageUrl: item.prenda.imageUrl.startsWith("http")
            ? item.prenda.imageUrl
            : `${base}${item.prenda.imageUrl}`,
        },
      })),
      photos: outfit.photos.map((photo) => ({
        ...photo,
        url: photo.url.startsWith("http") ? photo.url : `${base}${photo.url}`,
      })),
    }));

    return res.json(normalized);
  } catch (error) {
    console.error("list outfits error:", error);
    return res.status(500).json({
      error: "No se pudieron obtener los outfits",
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
    });

    return res.json({
      success: true,
      message: "Outfit actualizado correctamente",
      outfit,
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