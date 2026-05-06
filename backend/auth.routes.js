// backend/auth.routes.js
// backend/auth.routes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs").promises;

const upload = require("./lib/multer");
const repo = require("./users.pg");
const { uploadLocalFileToSupabase } = require("./services/supabaseStorage.service");

const r = express.Router();
const prisma = new PrismaClient();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function sign(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "dev", {
    expiresIn: "1d",
  });
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

function normalizeUserForResponse(req, user) {
  if (!user) return null;

  const avatarUrl = buildFullUrl(req, user.avatarUrl);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl,
    avatar_url: avatarUrl,
  };
}

async function getUserWithAvatar(req, user) {
  try {
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!dbUser) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: null,
        avatar_url: null,
      };
    }

    return normalizeUserForResponse(req, dbUser);
  } catch (error) {
    console.warn("No se pudo cargar avatarUrl:", error.message);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: null,
      avatar_url: null,
    };
  }
}

/* =========================
   Registro local
========================= */
r.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "faltan datos" });
    }

    const exists = await repo.findByEmail(email);

    if (exists) {
      return res.status(409).json({ error: "Email ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    const u = await repo.createLocal({
      name: name || "",
      email,
      passwordHash: hash,
    });

    return res.json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        avatarUrl: null,
        avatar_url: null,
      },
    });
  } catch (e) {
    console.error("ERROR /auth/register:", e);

    return res.status(500).json({
      error: "server error",
      detail: e.message,
    });
  }
});

/* =========================
   Login local
========================= */
r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "faltan datos" });
    }

    const u = await repo.findByEmail(email);

    if (!u) {
      return res.status(401).json({ error: "credenciales" });
    }

    if (!u.password) {
      return res.status(400).json({
        error: "Esta cuenta usa login social",
      });
    }

    const ok = await bcrypt.compare(password, u.password);

    if (!ok) {
      return res.status(401).json({ error: "credenciales" });
    }

    const token = sign(u.id);
    const userWithAvatar = await getUserWithAvatar(req, u);

    return res.json({
      token,
      user: userWithAvatar,
    });
  } catch (e) {
    console.error("ERROR /auth/login:", e);

    return res.status(500).json({
      error: "server error",
      detail: e.message,
    });
  }
});

/* =========================
   Google Sign-In
========================= */
r.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body || {};

    if (!idToken) {
      return res.status(400).json({ error: "falta idToken" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const provider = "google";
    const providerId = payload.sub;
    const email = payload.email;
    const name = payload.name || "";

    let u = await repo.findByProvider(provider, providerId);

    if (!u) {
      const existing = email ? await repo.findByEmail(email) : null;

      if (existing) {
        await repo.linkProvider(existing.id, provider, providerId);
        u = existing;
      } else {
        const created = await repo.createSocial({
          name,
          email,
        });

        await repo.linkProvider(created.id, provider, providerId);
        u = created;
      }
    }

    const token = sign(u.id);
    const userWithAvatar = await getUserWithAvatar(req, u);

    return res.json({
      token,
      user: userWithAvatar,
    });
  } catch (e) {
    console.error("❌ ERROR /auth/google:", e);

    return res.status(401).json({
      error: "token inválido",
      detail: e.message,
    });
  }
});

/* =========================
   Actualizar perfil
   PATCH /auth/profile
========================= */
r.patch("/profile", async (req, res) => {
  try {
    const { userId, name } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        error: "Falta userId",
      });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      user: normalizeUserForResponse(req, updatedUser),
    });
  } catch (e) {
    console.error("ERROR /auth/profile:", e);

    return res.status(500).json({
      error: "No se pudo actualizar el perfil",
      detail: e.message,
    });
  }
});

/* =========================
   Subir foto de perfil
   POST /auth/profile-photo
========================= */
r.post("/profile-photo", upload.single("image"), async (req, res) => {
  const tempPhotoPath = req.file?.path || null;

  try {
    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        error: "Falta userId",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Falta archivo image",
      });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    const uploaded = await uploadLocalFileToSupabase({
      localPath: tempPhotoPath,
      folder: "avatars",
      userId,
      fileName: req.file.originalname || req.file.filename,
    });

    const publicUrl = uploaded.publicUrl;

    console.log("[AUTH] avatar subido a Supabase:", publicUrl);

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: {
        avatarUrl: publicUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return res.json({
      success: true,
      message: "Foto de perfil actualizada",
      user: normalizeUserForResponse(req, updatedUser),
    });
  } catch (e) {
    console.error("ERROR /auth/profile-photo:", e);

    return res.status(500).json({
      error: "No se pudo actualizar la foto de perfil",
      detail: e.message,
    });
  } finally {
    await safeDeleteLocalFile(tempPhotoPath);
  }
});

/* =========================
   Compartir armario
   POST /auth/share
========================= */
r.post("/share", async (req, res) => {
  try {
    const { userId, isShared } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        error: "Falta userId",
      });
    }

    return res.json({
      success: true,
      message: Boolean(isShared)
        ? "Armario compartido correctamente"
        : "Armario marcado como privado",
      userId,
      isShared: Boolean(isShared),
    });
  } catch (e) {
    console.error("ERROR /auth/share:", e);

    return res.status(500).json({
      error: "No se pudo actualizar el estado del armario",
      detail: e.message,
    });
  }
});

module.exports = r;