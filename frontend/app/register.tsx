// app/register.tsx
import { post } from "../src/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import formStyles from '../src/styles/forms';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const redirectUri = __DEV__ 
    ? "https://auth.expo.dev/@pandemuerttoo/outfit-lab"
    : AuthSession.makeRedirectUri({ scheme: "outfitlab" });

  // ---------------- Google ----------------
  const [gRequest, gResponse, gPromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
    scopes: ["profile", "email"], 
    redirectUri: redirectUri,
  });

  // Manejar respuesta de Google
  useEffect(() => {
    if (gResponse?.type === "success") {
      const idToken = (gResponse as any)?.params?.id_token;
      if (idToken) {
        handleGoogleWithToken(idToken);
      }
    }
  }, [gResponse]);

  const handleGoogleWithToken = async (id_token: string) => {
    try {
      setIsLoading(true);
      const data = await post("/auth/google", { idToken: id_token });
      
      if (data?.token) {
        Alert.alert("¡Listo!", "Registro con Google exitoso");
        router.push("/login");
      } else {
        Alert.alert("Error", data?.error || "No se pudo registrar con Google");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Fallo Google");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Facebook ----------------
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FB_APP_ID || "",
    scopes: ["public_profile", "email"], 
    redirectUri: redirectUri,
  });

  // Manejar respuesta de Facebook
  useEffect(() => {
    if (fbResponse?.type === "success") {
      const accessToken = (fbResponse as any)?.authentication?.accessToken;
      if (accessToken) {
        handleFacebookWithToken(accessToken);
      }
    }
  }, [fbResponse]);

  const handleFacebookWithToken = async (access_token: string) => {
    try {
      setIsLoading(true);
      const data = await post("/auth/facebook", { accessToken: access_token });
      
      if (data?.token) {
        Alert.alert("¡Listo!", "Registro con Facebook exitoso");
        router.push("/login");
      } else {
        Alert.alert("Error", data?.error || "No se pudo registrar con Facebook");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Fallo Facebook");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Email / Password ----------------
  const handleRegister = async () => {
    // Validaciones
    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📝 Enviando registro...");
      const data = await post("/auth/register", {
        email: formData.email,
        password: formData.password,
        name: formData.nombre,
      });

      console.log("✅ Respuesta del servidor:", data);

      if (data?.success) {
        // Mostrar alerta y luego navegar a login
        Alert.alert(
          "¡Cuenta creada! 🎉", 
          "Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.",
          [
            { 
              text: "Ir a iniciar sesión", 
              onPress: () => {
                console.log("👆 Navegando a login...");
                // Limpiar el formulario
                setFormData({
                  nombre: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
                // Navegar a login
                router.push("/login");
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", data?.error || "Error al crear la cuenta");
      }
    } catch (err: any) {
      console.error("❌ Error en registro:", err);
      
      // Mostrar mensaje de error más descriptivo
      let errorMessage = "No se pudo conectar con el servidor";
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Test de conexión al backend (opcional, puedes eliminarlo)
  useEffect(() => {
    const testConnection = async () => {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL;
        console.log("🔗 API_URL configurada:", API_URL);
        
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log("✅ Conexión a backend exitosa:", data);
      } catch (error) {
        console.error("❌ No se puede conectar al backend:", error);
      }
    };
    testConnection();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40 }}>
        {/* Header con botón de regreso */}
        <View style={{ marginBottom: 40 }}>
          <TouchableOpacity 
            style={{ alignSelf: "flex-start", marginBottom: 20 }} 
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 10 }}>
            Crear cuenta
          </Text>
          <Text style={{ fontSize: 16, color: "#666" }}>
            Regístrate para comenzar a organizar tu armario
          </Text>
        </View>

        {/* Formulario */}
        <View style={{ marginBottom: 30 }}>
          {/* Nombre */}
          <View style={formStyles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={formStyles.inputIcon} />
            <TextInput
              style={formStyles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#999"
              value={formData.nombre}
              onChangeText={(t) => handleChange("nombre", t)}
              editable={!isLoading}
            />
          </View>

          {/* Email */}
          <View style={formStyles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={formStyles.inputIcon} />
            <TextInput
              style={formStyles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(t) => handleChange("email", t)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          {/* Password */}
          <View style={formStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={formStyles.inputIcon} />
            <TextInput
              style={formStyles.input}
              placeholder="Contraseña (mínimo 6 caracteres)"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(t) => handleChange("password", t)}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={formStyles.eyeIcon}
              disabled={isLoading}
            >
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={formStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={formStyles.inputIcon} />
            <TextInput
              style={formStyles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(t) => handleChange("confirmPassword", t)}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={formStyles.eyeIcon}
              disabled={isLoading}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Términos y condiciones */}
          <View style={{ marginBottom: 25 }}>
            <Text style={{ fontSize: 12, color: "#666", textAlign: "center", lineHeight: 16 }}>
              Al registrarte, aceptas nuestros{' '}
              <Text style={{ color: "#667eea", fontWeight: "500" }}>Términos de servicio</Text> y{' '}
              <Text style={{ color: "#667eea", fontWeight: "500" }}>Política de privacidad</Text>
            </Text>
          </View>

          {/* Botón de registro */}
          <TouchableOpacity 
            style={[formStyles.button, isLoading && { opacity: 0.5 }]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={formStyles.buttonText}>
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Text>
          </TouchableOpacity>

          {/* Separador */}
          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 25 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
            <Text style={{ marginHorizontal: 15, color: "#666", fontSize: 14 }}>o regístrate con</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
          </View>

          {/* Botón Google */}
          <TouchableOpacity
            style={[formStyles.socialButton, formStyles.googleButton, isLoading && { opacity: 0.5 }]}
            disabled={!gRequest || isLoading}
            onPress={() => gPromptAsync()}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={formStyles.socialButtonText}>Google</Text>
          </TouchableOpacity>

          {/* Botón Facebook - CORREGIDO */}
          <TouchableOpacity
            style={[formStyles.socialButton, formStyles.facebookButton, isLoading && { opacity: 0.5 }]}
            disabled={!fbRequest || isLoading}
            onPress={() => fbPromptAsync()} // 👈 ANTES ESTABA MAL: era gPromptAsync
          >
            <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            <Text style={formStyles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Link a login */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: "auto" }}>
          <Text style={{ color: "#666", fontSize: 14 }}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/login")} disabled={isLoading}> 
            <Text style={{ color: "#667eea", fontSize: 14, fontWeight: "600" }}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}