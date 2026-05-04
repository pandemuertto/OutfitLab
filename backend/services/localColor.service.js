const sharp = require("sharp");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;

  if (diff === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / diff) % 6;
  } else if (max === g) {
    h = (b - r) / diff + 2;
  } else {
    h = (r - g) / diff + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return {
    h,
    s: Number((s * 100).toFixed(2)),
    v: Number((v * 100).toFixed(2)),
  };
}

function clampBox(box, width, height) {
  if (!box) return null;

  const x = Math.max(0, Math.floor((box.x || 0) * width));
  const y = Math.max(0, Math.floor((box.y || 0) * height));
  const w = Math.max(1, Math.floor((box.width || 0) * width));
  const h = Math.max(1, Math.floor((box.height || 0) * height));

  const safeWidth = Math.min(w, width - x);
  const safeHeight = Math.min(h, height - y);

  return {
    left: x,
    top: y,
    width: Math.max(1, safeWidth),
    height: Math.max(1, safeHeight),
  };
}

function classifyDetailedColor({ r, g, b }) {
  const { h, s, v } = rgbToHsv(r, g, b);

  // Blanco / negro / gris / crema / beige
  if (v <= 15) return "negro";

  if (s <= 12) {
    if (v >= 88) return "blanco";
    if (v >= 70) return "gris claro";
    if (v >= 35) return "gris";
    return "gris oscuro";
  }

  if (h >= 35 && h <= 55 && s <= 30 && v >= 75) return "crema";
  if (h >= 25 && h <= 45 && s <= 45 && v >= 65) return "beige";

  // Rojos / vino / rosa
  if (h >= 345 || h <= 10) {
    if (v < 45) return "vino";
    if (s < 45 && v > 75) return "rosa palo";
    return "rojo";
  }

  if (h >= 11 && h <= 24) {
    if (v < 50) return "café";
    return "naranja";
  }

  if (h >= 25 && h <= 34) {
    if (v < 45) return "café oscuro";
    return "mostaza";
  }

  if (h >= 35 && h <= 64) {
    return "amarillo";
  }

  // Verdes
  if (h >= 65 && h <= 169) {
    if (h >= 65 && h <= 90 && v < 55) return "verde oliva";
    if (v < 45) return "verde oscuro";
    if (v > 75 && s < 55) return "verde claro";
    return "verde";
  }

  // Azules
  if (h >= 170 && h <= 260) {
    if (v < 45) return "azul marino";
    if (v > 75 && s < 60) return "azul claro";
    return "azul";
  }

  // Morados / lilas
  if (h >= 261 && h <= 320) {
    if (v > 75 && s < 50) return "lila";
    return "morado";
  }

  // Rosas
  if (h >= 321 && h <= 344) {
    if (v > 75 && s < 50) return "rosa palo";
    return "rosa";
  }

  return "otro";
}

async function extractDominantColorFromImage(imagePath, bbox = null) {
  const baseImage = sharp(imagePath);
  const metadata = await baseImage.metadata();

  let pipeline = sharp(imagePath);

  if (bbox && metadata.width && metadata.height) {
    const region = clampBox(bbox, metadata.width, metadata.height);
    if (region) {
      pipeline = pipeline.extract(region);
    }
  }

  // Reducimos tamaño para análisis rápido y uniforme
  const { data, info } = await pipeline
    .resize(80, 80, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const { s, v } = rgbToHsv(r, g, b);

    // Ignorar brillos extremos y sombras extremas
    if (v < 8 || v > 98) continue;

    // Ignorar casi blancos del fondo si hay muy baja saturación y muy alto brillo
    if (s < 8 && v > 90) continue;

    totalR += r;
    totalG += g;
    totalB += b;
    count++;
  }

  // Si filtramos demasiado, usamos todos los pixeles
  if (count === 0) {
    for (let i = 0; i < data.length; i += info.channels) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }
  }

  const r = totalR / count;
  const g = totalG / count;
  const b = totalB / count;

  const hex = rgbToHex(r, g, b);
  const hsv = rgbToHsv(r, g, b);
  const colorName = classifyDetailedColor({
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  });

  return {
    colorName,
    hex,
    rgb: {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
    },
    hsv,
  };
}

module.exports = {
  extractDominantColorFromImage,
  classifyDetailedColor,
  rgbToHsv,
  rgbToHex,
};