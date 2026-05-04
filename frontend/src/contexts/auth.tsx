// src/contexts/auth.tsx
// frontend/src/contexts/auth.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../api";

export type AuthUser = {
  id: string;
  name?: string | null;
  email: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (user: AuthUser, token?: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (data?: any) => Promise<void>;
  hasCompletedOnboarding: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

        console.log("📦 Usuario almacenado:", storedUser);
        console.log("🔑 Token almacenado:", storedToken ? "Sí existe" : "No existe");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.log("Error cargando sesión:", e);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (newUser: AuthUser, newToken?: string) => {
    try {
      console.log("🔐 Guardando sesión:", newUser);

      setUser(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

      if (newToken) {
        setToken(newToken);
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      }
    } catch (e) {
      console.log("Error guardando sesión:", e);
      throw e;
    }
  };

  const completeOnboarding = async (data?: any) => {
    try {
      if (data) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ONBOARDING_DATA,
          JSON.stringify(data)
        );
      }

      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
      console.log("✅ Onboarding completado");
    } catch (e) {
      console.log("Error guardando onboarding:", e);
      throw e;
    }
  };

  const hasCompletedOnboarding = async () => {
    const completed = await AsyncStorage.getItem(
      STORAGE_KEYS.ONBOARDING_COMPLETED
    );

    return completed === "true";
  };

  const logout = async () => {
    try {
      console.log("🚪 Cerrando sesión");

      setUser(null);
      setToken(null);

      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);

      /**
       * IMPORTANTE:
       * No borro onboardingData ni onboardingCompleted aquí.
       * Así, si el usuario vuelve a iniciar sesión en el mismo celular,
       * no vuelve a pasar por onboarding.
       *
       * Si quieres que al cerrar sesión se borre todo,
       * también puedes borrar estas dos llaves.
       */
    } catch (e) {
      console.log("Error cerrando sesión:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        completeOnboarding,
        hasCompletedOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }

  return ctx;
}