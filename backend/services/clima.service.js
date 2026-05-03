const axios = require("axios");

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

async function getClimaPorCiudad(ciudad) {
  if (!OPENWEATHER_API_KEY) {
    console.warn("⚠️ OPENWEATHER_API_KEY no configurada en .env");
    return null;
  }

  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        q: ciudad,
        appid: OPENWEATHER_API_KEY,
        units: "metric",
        lang: "es"
      }
    });

    const data = response.data;
    return {
      ciudad: data.name,
      pais: data.sys.country,
      temperatura: data.main.temp,
      sensacionTermica: data.main.feels_like,
      temperaturaMin: data.main.temp_min,
      temperaturaMax: data.main.temp_max,
      humedad: data.main.humidity,
      presion: data.main.pressure,
      descripcion: data.weather[0].description,
      icono: data.weather[0].icon,
      viento: {
        velocidad: data.wind.speed,
        direccion: data.wind.deg
      },
      nubosidad: data.clouds.all,
      visibilidad: data.visibility,
      amanecer: data.sys.sunrise,
      anochecer: data.sys.sunset
    };
  } catch (error) {
    console.error("❌ Error obteniendo clima:", error.message);
    return null;
  }
}

function obtenerSugerenciasClima(clima) {
  const sugerencias = {
    tags: [],
    descripcion: "",
    consejos: []
  };

  if (!clima) {
    sugerencias.tags = ["temperado"];
    sugerencias.descripcion = "Clima templado";
    return sugerencias;
  }

  const temp = clima.temperatura;
  const descripcion = clima.descripcion.toLowerCase();
  const nubosidad = clima.nubosidad;

  if (temp < 5) {
    sugerencias.tags = ["frío", "invierno"];
    sugerencias.descripcion = "Muy frío";
    sugerencias.consejos = ["Llevar abrigo pesado", "Bufanda y guantes", "Capas de ropa"];
  } else if (temp < 15) {
    sugerencias.tags = ["frío", "otoño"];
    sugerencias.descripcion = "Frío";
    sugerencias.consejos = ["Llevar chaqueta", "Ropa de capas", "Pants o jeans"];
  } else if (temp < 25) {
    sugerencias.tags = ["temperado", "primavera"];
    sugerencias.descripcion = "Templado";
    sugerencias.consejos = ["Ropa ligera", "Posiblemente camisa de manga larga"];
  } else {
    sugerencias.tags = ["calor", "verano"];
    sugerencias.descripcion = "Caluroso";
    sugerencias.consejos = ["Ropa ligera de algodón", "Shorts y playeras", "Protector solar"];
  }

  if (descripcion.includes("lluvia") || descripcion.includes("drizzle")) {
    sugerencias.tags.push("lluvia");
    sugerencias.consejos.push("Llevar paraguas o impermeable");
  }

  if (descripcion.includes("nieve") || descripcion.includes("snow")) {
    sugerencias.tags.push("nieve");
    sugerencias.consejos.push("Llevar botas impermeables");
  }

  if (descripcion.includes("tormenta") || descripcion.includes("thunderstorm")) {
    sugerencias.tags.push("tormenta");
    sugerencias.consejos.push("Evitar actividades al aire libre");
  }

  if (nubosidad > 70) {
    sugerencias.tags.push("nublado");
  }

  if (clima.viento && clima.viento.velocidad > 10) {
    sugerencias.tags.push("ventoso");
    sugerencias.consejos.push("Llevar algo que no se vuele");
  }

  return sugerencias;
}

module.exports = {
  getClimaPorCiudad,
  obtenerSugerenciasClima
};