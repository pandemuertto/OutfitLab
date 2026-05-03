const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ================== Obtener todos los viajes del usuario ==================
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const viajes = await prisma.viaje.findMany({
      where: { userId },
      orderBy: { fechaInicio: "asc" },
      include: {
        prendas: {
          include: { prenda: true }
        },
        articulos: {
          orderBy: { orden: "asc" }
        }
      }
    });

    res.json({ viajes });
  } catch (err) {
    console.error("Error obteniendo viajes:", err);
    res.status(500).json({ error: "Error obteniendo viajes" });
  }
});

// ================== Obtener un viaje específico ==================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await prisma.viaje.findUnique({
      where: { id },
      include: {
        prendas: {
          include: { prenda: true },
          orderBy: { orden: "asc" }
        },
        articulos: {
          orderBy: { orden: "asc" }
        }
      }
    });

    if (!viaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    res.json({ viaje });
  } catch (err) {
    console.error("Error obteniendo viaje:", err);
    res.status(500).json({ error: "Error obteniendo viaje" });
  }
});

// ================== Crear un viaje ==================
router.post("/", async (req, res) => {
  try {
    const { userId, titulo, destino, fechaInicio, fechaFin, descripcion, clima, prendaIds } = req.body;

    if (!userId || !titulo || !fechaInicio || !fechaFin) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos (userId, titulo, fechaInicio, fechaFin)" 
      });
    }

    const viaje = await prisma.viaje.create({
      data: {
        userId,
        titulo,
        destino: destino || null,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        descripcion: descripcion || null,
        clima: clima || null,
        prendas: prendaIds && prendaIds.length > 0 ? {
          create: prendaIds.map((prendaId, index) => ({
            prendaId,
            orden: index
          }))
        } : undefined
      },
      include: {
        prendas: {
          include: { prenda: true }
        },
        articulos: true
      }
    });

    console.log("✅ Viaje creado:", viaje.id);
    res.status(201).json({ viaje });
  } catch (err) {
    console.error("Error creando viaje:", err);
    res.status(500).json({ error: "Error creando viaje" });
  }
});

// ================== Actualizar un viaje ==================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, destino, fechaInicio, fechaFin, descripcion, clima } = req.body;

    const viaje = await prisma.viaje.update({
      where: { id },
      data: {
        titulo,
        destino,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined,
        descripcion,
        clima
      },
      include: {
        prendas: {
          include: { prenda: true }
        },
        articulos: true
      }
    });

    res.json({ viaje });
  } catch (err) {
    console.error("Error actualizando viaje:", err);
    res.status(500).json({ error: "Error actualizando viaje" });
  }
});

// ================== Eliminar un viaje ==================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.viaje.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando viaje:", err);
    res.status(500).json({ error: "Error eliminando viaje" });
  }
});

// ================== Agregar prendas al viaje ==================
router.post("/:id/prendas", async (req, res) => {
  try {
    const { id } = req.params;
    const { prendaIds } = req.body;

    if (!prendaIds || !Array.isArray(prendaIds)) {
      return res.status(400).json({ error: "Se requiere un array de prendaIds" });
    }

    const viaje = await prisma.viaje.findUnique({
      where: { id },
      include: { prendas: true }
    });

    if (!viaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    const existingPrendaIds = viaje.prendas.map(p => p.prendaId);
    const newPrendaIds = prendaIds.filter(id => !existingPrendaIds.includes(id));

    const maxOrden = viaje.prendas.length > 0 
      ? Math.max(...viaje.prendas.map(p => p.orden)) 
      : 0;

    await prisma.viajePrenda.createMany({
      data: newPrendaIds.map((prendaId, index) => ({
        viajeId: id,
        prendaId,
        orden: maxOrden + index + 1
      }))
    });

    const viajeActualizado = await prisma.viaje.findUnique({
      where: { id },
      include: {
        prendas: {
          include: { prenda: true }
        }
      }
    });

    res.json({ viaje: viajeActualizado });
  } catch (err) {
    console.error("Error agregando prendas:", err);
    res.status(500).json({ error: "Error agregando prendas" });
  }
});

// ================== Marcar/desmarcar prenda como empacada ==================
router.patch("/:id/prendas/:prendaId/empacado", async (req, res) => {
  try {
    const { id, prendaId } = req.params;
    const { empacado } = req.body;

    const viajePrenda = await prisma.viajePrenda.update({
      where: {
        viajeId_prendaId: {
          viajeId: id,
          prendaId: parseInt(prendaId)
        }
      },
      data: { empacado }
    });

    res.json({ viajePrenda });
  } catch (err) {
    console.error("Error actualizando estado de prenda:", err);
    res.status(500).json({ error: "Error actualizando estado" });
  }
});

// ================== Eliminar prenda del viaje ==================
router.delete("/:id/prendas/:prendaId", async (req, res) => {
  try {
    const { id, prendaId } = req.params;

    await prisma.viajePrenda.delete({
      where: {
        viajeId_prendaId: {
          viajeId: id,
          prendaId: parseInt(prendaId)
        }
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando prenda del viaje:", err);
    res.status(500).json({ error: "Error eliminando prenda" });
  }
});

// ================== Agregar artículo manual ==================
router.post("/:id/articulos", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "Se requiere el nombre del artículo" });
    }

    const viaje = await prisma.viaje.findUnique({
      where: { id },
      include: { articulos: true }
    });

    if (!viaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    const maxOrden = viaje.articulos.length > 0 
      ? Math.max(...viaje.articulos.map(a => a.orden)) 
      : 0;

    const articulo = await prisma.articuloManual.create({
      data: {
        viajeId: id,
        nombre,
        orden: maxOrden + 1
      }
    });

    res.status(201).json({ articulo });
  } catch (err) {
    console.error("Error agregando artículo:", err);
    res.status(500).json({ error: "Error agregando artículo" });
  }
});

// ================== Marcar/desmarcar artículo como empacado ==================
router.patch("/:id/articulos/:articuloId/empacado", async (req, res) => {
  try {
    const { id, articuloId } = req.params;
    const { empacado } = req.body;

    const articulo = await prisma.articuloManual.update({
      where: { id: articuloId },
      data: { empacado }
    });

    res.json({ articulo });
  } catch (err) {
    console.error("Error actualizando estado de artículo:", err);
    res.status(500).json({ error: "Error actualizando estado" });
  }
});

// ================== Eliminar artículo manual ==================
router.delete("/:id/articulos/:articuloId", async (req, res) => {
  try {
    const { articuloId } = req.params;

    await prisma.articuloManual.delete({
      where: { id: articuloId }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando artículo:", err);
    res.status(500).json({ error: "Error eliminando artículo" });
  }
});

// ================== Obtener progreso de empacado ==================
router.get("/:id/progreso", async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await prisma.viaje.findUnique({
      where: { id },
      include: {
        prendas: true,
        articulos: true
      }
    });

    if (!viaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    const totalPrendas = viaje.prendas.length;
    const prendasEmpacadas = viaje.prendas.filter(p => p.empacado).length;
    const totalArticulos = viaje.articulos.length;
    const articulosEmpacados = viaje.articulos.filter(a => a.empacado).length;

    const totalItems = totalPrendas + totalArticulos;
    const totalEmpacados = prendasEmpacadas + articulosEmpacados;
    const porcentaje = totalItems > 0 ? Math.round((totalEmpacados / totalItems) * 100) : 0;

    res.json({
      progreso: {
        totalPrendas,
        prendasEmpacadas,
        totalArticulos,
        articulosEmpacados,
        totalItems,
        totalEmpacados,
        porcentaje
      }
    });
  } catch (err) {
    console.error("Error obteniendo progreso:", err);
    res.status(500).json({ error: "Error obteniendo progreso" });
  }
});

module.exports = router;