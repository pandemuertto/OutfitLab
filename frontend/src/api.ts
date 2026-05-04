// frontend/src/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  USER: "@outfitlab:user",
  TOKEN: "@outfitlab:token",
  ONBOARDING_DATA: "@outfitlab:onboardingData",
  ONBOARDING_COMPLETED: "@outfitlab:onboardingCompleted",
};

const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL || "";

export const API_URL = RAW_API_URL.trim().replace(/\/$/, "");

console.log("🌐 API_URL =", API_URL);

if (!API_URL) {
  console.warn(
    "⚠️ EXPO_PUBLIC_API_URL no está configurada. Revisa tu archivo .env del frontend."
  );
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Error en la petición"
  );
}

export async function get<T = any>(path: string, config?: any): Promise<T> {
  path = normalizePath(path);

  console.log(`📡 GET ${API_URL}${path}`);

  try {
    const { data } = await api.get(path, {
      ...(config || {}),
    });

    return data;
  } catch (error: any) {
    console.error(`❌ GET error ${path}:`, getErrorMessage(error));
    throw error;
  }
}

export async function post<T = any>(
  path: string,
  body?: any,
  config?: any
): Promise<T> {
  path = normalizePath(path);

  console.log(`📡 POST ${API_URL}${path}`, body);

  try {
    const { data } = await api.post(path, body ?? {}, {
      ...(config || {}),
    });

    console.log(`✅ POST ${path} éxito:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ POST error ${path}:`, getErrorMessage(error));
    throw error;
  }
}

export async function put<T = any>(
  path: string,
  body?: any,
  config?: any
): Promise<T> {
  path = normalizePath(path);

  console.log(`📡 PUT ${API_URL}${path}`, body);

  try {
    const { data } = await api.put(path, body ?? {}, {
      ...(config || {}),
    });

    console.log(`✅ PUT ${path} éxito:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ PUT error ${path}:`, getErrorMessage(error));
    throw error;
  }
}

export async function del<T = any>(
  path: string,
  body?: any,
  config?: any
): Promise<T> {
  path = normalizePath(path);

  console.log(`📡 DELETE ${API_URL}${path}`, body);

  try {
    const { data } = await api.delete(path, {
      data: body ?? {},
      ...(config || {}),
    });

    console.log(`✅ DELETE ${path} éxito:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ DELETE error ${path}:`, getErrorMessage(error));
    throw error;
  }
}

export default api;