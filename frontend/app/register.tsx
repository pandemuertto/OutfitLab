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
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import formStyles from '../src/styles/forms';
import { colors } from '../src/styles/theme';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 👈 Modal de éxito

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const redirectUri = __DEV__ 
    ? "http://localhost:8081/auth"
    : AuthSession.makeRedirectUri({ scheme: "outfitlab", path: "auth" });

  // ---------------- SOLO GOOGLE ----------------
  const [gRequest, gResponse, gPromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
    scopes: ["profile", "email"], 
    redirectUri,
  });

  useEffect(() => {
    if (gResponse?.type === "success") {
      const idToken = gResponse.params?.id_token;
      if (idToken) {
        handleGoogleWithToken(idToken);
      }
    } else if (gResponse?.type === "error") {
      Alert.alert("Error", "No se pudo autenticar con Google");
    }
  }, [gResponse]);

  const handleGoogleWithToken = async (idToken: string) => {
    setIsLoading(true);
    try {
      console.log("📤 Enviando token Google al backend...");
      const data = await post("/auth/google", { idToken });
      console.log("✅ Respuesta Google:", data);
      
      if (data?.token) {
        // Mostrar modal de éxito
        setShowSuccessModal(true);
        // Redirigir después de 2 segundos
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push("/login");
        }, 2000);
      } else {
        Alert.alert("Error", data?.error || "No se pudo registrar con Google");
      }
    } catch (e: any) {
      console.error("❌ Error Google:", e);
      Alert.alert("Error", e?.message || "Fallo al conectar con Google");
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
      console.log("📝 Registrando usuario...");
      const data = await post("/auth/register", {
        email: formData.email,
        password: formData.password,
        name: formData.nombre,
      });
      console.log("✅ Registro exitoso:", data);

      if (data?.success) {
        // Mostrar modal de éxito
        setShowSuccessModal(true);
        // Limpiar formulario
        setFormData({ nombre: "", email: "", password: "", confirmPassword: "" });
        // Redirigir después de 2 segundos
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push("/login");
        }, 2000);
      } else {
        Alert.alert("Error", data?.error || "Error al crear la cuenta");
      }
    } catch (err: any) {
      console.error("❌ Error registro:", err);
      Alert.alert(
        "Error", 
        err?.response?.data?.error || err?.message || "No se pudo conectar con el servidor"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40 }}>
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
            Regístrate para comenzar
          </Text>
        </View>

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
              placeholder="Contraseña"
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
              <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 25 }}>
            <Text style={{ fontSize: 12, color: "#666", textAlign: "center", lineHeight: 16 }}>
              Al registrarte, aceptas nuestros{' '}
              <Text style={{ color: "#667eea", fontWeight: "500" }}>Términos de servicio</Text> y{' '}
              <Text style={{ color: "#667eea", fontWeight: "500" }}>Política de privacidad</Text>
            </Text>
          </View>

          <TouchableOpacity 
            style={[formStyles.button, isLoading && { opacity: 0.5 }]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={formStyles.buttonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 25 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
            <Text style={{ marginHorizontal: 15, color: "#666", fontSize: 14 }}>
              o regístrate con
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
          </View>

          {/* SOLO GOOGLE */}
          <TouchableOpacity
            style={[formStyles.socialButton, formStyles.googleButton, isLoading && { opacity: 0.5 }]}
            disabled={!gRequest || isLoading}
            onPress={() => gPromptAsync()}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={formStyles.socialButtonText}>Google</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text style={{ color: "#666", fontSize: 14 }}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/login")} disabled={isLoading}> 
            <Text style={{ color: "#667eea", fontSize: 14, fontWeight: "600" }}>
              Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de éxito */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.modalTitle}>¡Cuenta creada exitosamente!</Text>
            <Text style={styles.modalText}>Serás redirigido al login...</Text>
            <ActivityIndicator size="small" color="#667eea" style={{ marginTop: 15 }} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});