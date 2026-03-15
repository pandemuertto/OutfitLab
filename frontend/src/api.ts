// frontend/src/api.ts
import axios from "axios";

// Usar la variable de entorno SIEMPRE
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
console.log("🌐 API_URL =", API_URL);

// Cliente Axios configurado con más timeout para debug
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentamos a 30 segundos
});

// ======================================================
// 🔵 GET – para traer datos
// ======================================================
export async function get<T = any>(path: string, config?: any): Promise<T> {
  if (!path.startsWith("/")) path = `/${path}`;
  console.log(`📡 GET ${API_URL}${path}`);
  
  try {
    const { data } = await api.get(path, {
      ...(config || {}),
    });
    return data;
  } catch (error) {
    console.error(`❌ GET error ${path}:`, error);
    throw error;
  }
}

// ======================================================
// 🔵 POST – para enviar datos
// ======================================================
export async function post<T = any>(
  path: string,
  body?: any,
  config?: any
): Promise<T> {
  if (!path.startsWith("/")) path = `/${path}`;
  console.log(`📡 POST ${API_URL}${path}`, body);

  try {
    const { data } = await api.post(
      path,
      body ?? {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        ...(config || {}),
      }
    );
    console.log(`✅ POST ${path} éxito:`, data);
    return data;
  } catch (error) {
    console.error(`❌ POST error ${path}:`, error);
    throw error;
  }
}

export async function put(path: string, body: any) {
  console.log(`📡 PUT ${API_URL}${path}`, body);
  
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Error en la petición");
    }
    console.log(`✅ PUT ${path} éxito:`, data);
    return data;
  } catch (error) {
    console.error(`❌ PUT error ${path}:`, error);
    throw error;
  }
}

export async function del(path: string, body?: any) {
  console.log(`📡 DELETE ${API_URL}${path}`, body);
  
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Error en la petición");
    }
    console.log(`✅ DELETE ${path} éxito:`, data);
    return data;
  } catch (error) {
    console.error(`❌ DELETE error ${path}:`, error);
    throw error;
  }
}