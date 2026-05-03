const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getClimaPorCiudad, obtenerSugerenciasClima } = require("../services/clima.service");

// ================== Obtener clima de una ciudad ==================
router.get("/:ciudad", async (req, res) => {
  try {
    const { ciudad } = req.params;
    const clima = await getClimaPorCiudad(ciudad);

    if (!clima) {
      return res.status(500).json({ 
        error: "No se pudo obtener el clima. Verifica la API key en .env" 
      });
    }

    const sugerencias = obtenerSugerenciasClima(clima);

    res.json({
      clima,
      sugerencias
    });
  } catch (err) {
    console.error("Error obteniendo clima:", err);
    res.status(500).json({ error: "Error obteniendo clima" });
  }
});

// ================== Obtener prendas filtradas por clima ==================
router.get("/:ciudad/prendas/:userId", async (req, res) => {
  try {
    const { ciudad, userId } = req.params;
    const clima = await getClimaPorCiudad(ciudad);

    if (!clima) {
      return res.status(500).json({ 
        error: "No se pudo obtener el clima" 
      });
    }

    const sugerencias = obtenerSugerenciasClima(clima);
    const tags = sugerencias.tags;

    const etiquetasBusqueda = tags.map(t => t.toLowerCase());

    const prendas = await prisma.prenda.findMany({
      where: {
        userId
      },
      include: {
        tags: {
          include: { tag: true }
        }
      }
    });

    const prendasFiltradas = prendas.filter(prenda => {
      const prendaTags = prenda.tags
        .map(pt => pt.tag.name.toLowerCase());
      
      return etiquetasBusqueda.some(tag => 
        prendaTags.includes(tag) || 
        prendaTags.some(pt => pt.includes(tag))
      );
    });

    res.json({
      clima,
      sugerencias,
      prendasFiltradas,
      totalPrendas: prendasFiltradas.length
    });
  } catch (err) {
    console.error("Error filtrando prendas:", err);
    res.status(500).json({ error: "Error filtrando prendas" });
  }
});

module.exports = router;