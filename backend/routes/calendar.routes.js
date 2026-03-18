const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ================== Obtener eventos de un usuario ==================
// GET /api/calendar/user/:userId?month=2024-03&year=2024
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    let whereClause = { userId };

    // Filtrar por mes/año si se proporcionan
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
      include: {
        outfit: {
          include: {
            items: {
              include: { prenda: true }
            }
          }
        }
      }
    });

    console.log(`📅 Eventos encontrados para usuario ${userId}: ${events.length}`);
    res.json({ events });
  } catch (err) {
    console.error("Error obteniendo eventos:", err);
    res.status(500).json({ error: "Error obteniendo eventos" });
  }
});

// ================== Crear evento ==================
// POST /api/calendar
router.post("/", async (req, res) => {
  try {
    const { userId, title, description, date, startTime, endTime, outfitId } = req.body;

    if (!userId || !title || !date) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos (userId, title, date)" 
      });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        description: description || null,
        date: new Date(date),
        startTime: startTime || null,
        endTime: endTime || null,
        outfitId: outfitId || null
      },
      include: {
        outfit: {
          include: {
            items: {
              include: { prenda: true }
            }
          }
        }
      }
    });

    console.log("✅ Evento creado:", event.id);
    res.status(201).json({ event });
  } catch (err) {
    console.error("Error creando evento:", err);
    res.status(500).json({ error: "Error creando evento" });
  }
});

// ================== Actualizar evento ==================
// PUT /api/calendar/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, outfitId } = req.body;

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        outfitId
      },
      include: {
        outfit: {
          include: {
            items: {
              include: { prenda: true }
            }
          }
        }
      }
    });

    res.json({ event });
  } catch (err) {
    console.error("Error actualizando evento:", err);
    res.status(500).json({ error: "Error actualizando evento" });
  }
});

// ================== Eliminar evento ==================
// DELETE /api/calendar/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.calendarEvent.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando evento:", err);
    res.status(500).json({ error: "Error eliminando evento" });
  }
});

// ================== Obtener eventos por fecha ==================
// GET /api/calendar/date/:userId?date=2024-03-15
router.get("/date/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Fecha requerida" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { startTime: "asc" },
      include: {
        outfit: {
          include: {
            items: {
              include: { prenda: true }
            }
          }
        }
      }
    });

    res.json({ events });
  } catch (err) {
    console.error("Error obteniendo eventos por fecha:", err);
    res.status(500).json({ error: "Error obteniendo eventos" });
  }
});

module.exports = router;