// app/login.tsx
// import { post } from "../src/api";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import React, { useState, useEffect } from "react";
// import {
//   Alert,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import * as AuthSession from "expo-auth-session";
// import * as WebBrowser from "expo-web-browser";
// import * as Google from "expo-auth-session/providers/google";
// import * as Facebook from "expo-auth-session/providers/facebook";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import formStyles from "../src/styles/forms";
// import { useAuth } from "../src/contexts/auth";

// WebBrowser.maybeCompleteAuthSession();

// export default function LoginScreen() {
//   const { login } = useAuth(); // 👈 para actualizar el usuario global

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const redirectUri = __DEV__
//     ? "https://auth.expo.dev/@pandemuerttoo/outfit-lab"
//     : AuthSession.makeRedirectUri({ scheme: "outfitlab" });

//   console.log("redirectUri ->", redirectUri);

//   // --- Google (id_token) ---
//   const [gRequest, gResponse, gPromptAsync] = Google.useAuthRequest({
//     clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
//     scopes: ["profile", "email"],
//     redirectUri,
//   });

//   useEffect(() => {
//     if (gResponse?.type === "success" && gResponse.params?.id_token) {
//       handleGoogleWithToken(gResponse.params.id_token);
//     }
//   }, [gResponse]);

//   // --- Facebook (access_token) ---
//   const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
//     clientId: process.env.EXPO_PUBLIC_FB_APP_ID || "",
//     scopes: ["public_profile", "email"],
//     redirectUri,
//   });

//   useEffect(() => {
//     if (fbResponse?.type === "success") {
//       const accessToken = (fbResponse as any)?.authentication?.accessToken;
//       if (accessToken) {
//         handleFacebookWithToken(accessToken);
//       }
//     }
//   }, [fbResponse]);

//   // ========== EMAIL / PASSWORD ==========
//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert("Error", "Por favor completa todos los campos");
//       return;
//     }

//     try {
//       const data = await post("/auth/login", { email, password }); // { user, token, isNewUser? }

//       if (!data.user || !data.user.id) {
//         throw new Error("Respuesta de login inválida (falta user.id)");
//       }

//       // 👉 Actualizar contexto + guardar en AsyncStorage
//       await login(
//         {
//           id: data.user.id,
//           name: data.user.name,
//           email: data.user.email,
//         },
//         data.token
//       );

//       // Mantener tu flag de "nuevo usuario"
//       if (data.isNewUser || data.user?.isNewUser) {
//         await AsyncStorage.setItem("isNewUser", "true");
//         Alert.alert(
//           "¡Bienvenido!",
//           `Hola ${data.user?.name ?? ""}. Completa tu perfil para continuar.`
//         );
//       } else {
//         await AsyncStorage.removeItem("isNewUser");
//         Alert.alert(
//           "Éxito",
//           `Bienvenido de nuevo, ${data.user?.name ?? ""}`
//         );
//       }

//       router.replace("/(tabs)");
//     } catch (err: any) {
//       console.error("LOGIN ERROR:", err?.message || err);
//       Alert.alert(
//         "Error",
//         err?.response?.data?.message ||
//           err?.message ||
//           "No se pudo conectar con el servidor"
//       );
//     }
//   };

//   // ========== GOOGLE ==========
//   const handleGoogle = async () => {
//     try {
//       await gPromptAsync();
//     } catch (e: any) {
//       Alert.alert("Google", e?.message || "No se pudo abrir Google");
//     }
//   };

//   const handleGoogleWithToken = async (idToken: string) => {
//     try {
//       const data = await post("/auth/google", { idToken }); // { user, token, isNewUser? }

//       if (!data.user || !data.user.id) {
//         throw new Error("Respuesta de Google inválida (falta user.id)");
//       }

//       await login(
//         {
//           id: data.user.id,
//           name: data.user.name,
//           email: data.user.email,
//         },
//         data.token
//       );

//       if (data.isNewUser || data.user?.isNewUser) {
//         await AsyncStorage.setItem("isNewUser", "true");
//         Alert.alert(
//           "¡Bienvenido!",
//           `Hola ${data.user?.name ?? ""}. Completa tu perfil.`
//         );
//       } else {
//         await AsyncStorage.removeItem("isNewUser");
//         Alert.alert(
//           "Éxito",
//           `Hola, ${data.user?.name ?? "Google User"}`
//         );
//       }

//       router.replace("/(tabs)");
//     } catch (e: any) {
//       console.error(e);
//       Alert.alert(
//         "Google",
//         e?.response?.data?.message ||
//           e?.message ||
//           "Error al autenticar con Google"
//       );
//     }
//   };

//   // ========== FACEBOOK ==========
//   const handleFacebook = async () => {
//     try {
//       await fbPromptAsync();
//     } catch (e: any) {
//       Alert.alert("Facebook", e?.message || "No se pudo abrir Facebook");
//     }
//   };

//   const handleFacebookWithToken = async (accessToken: string) => {
//     try {
//       const data = await post("/auth/facebook", { accessToken }); // { user, token, isNewUser? }

//       if (!data.user || !data.user.id) {
//         throw new Error("Respuesta de Facebook inválida (falta user.id)");
//       }

//       await login(
//         {
//           id: data.user.id,
//           name: data.user.name,
//           email: data.user.email,
//         },
//         data.token
//       );

//       if (data.isNewUser || data.user?.isNewUser) {
//         await AsyncStorage.setItem("isNewUser", "true");
//         Alert.alert(
//           "¡Bienvenido!",
//           `Hola ${data.user?.name ?? ""}. Completa tu perfil.`
//         );
//       } else {
//         await AsyncStorage.removeItem("isNewUser");
//         Alert.alert(
//           "Éxito",
//           `Hola, ${data.user?.name ?? "Facebook User"}`
//         );
//       }

//       router.replace("/(tabs)");
//     } catch (e: any) {
//       console.error(e);
//       Alert.alert(
//         "Facebook",
//         e?.response?.data?.message ||
//           e?.message ||
//           "Error al autenticar con Facebook"
//       );
//     }
//   };

//   // ========== UI ==========
//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: "#fff" }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView
//         contentContainerStyle={{
//           flexGrow: 1,
//           paddingHorizontal: 30,
//           paddingTop: 60,
//           paddingBottom: 40,
//         }}
//       >
//         <View style={{ marginBottom: 50, alignItems: "center" }}>
//           <TouchableOpacity
//             style={{ alignSelf: "flex-start", marginBottom: 20 }}
//             onPress={() => router.back()}
//           >
//             <Ionicons name="arrow-back" size={24} color="#333" />
//           </TouchableOpacity>

//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               marginBottom: 20,
//             }}
//           >
//             <Image
//               source={require("../assets/images/icom.png")}
//               style={{ width: 40, height: 40, marginRight: 10 }}
//               resizeMode="contain"
//             />
//             <Text
//               style={{
//                 fontSize: 28,
//                 fontWeight: "bold",
//                 color: "#667eea",
//               }}
//             >
//               OutfitLab
//             </Text>
//           </View>

//           <Text
//             style={{
//               fontSize: 24,
//               fontWeight: "bold",
//               color: "#333",
//               marginBottom: 10,
//               textAlign: "center",
//             }}
//           >
//             Bienvenido de nuevo
//           </Text>
//           <Text
//             style={{ fontSize: 16, color: "#666", textAlign: "center" }}
//           >
//             Inicia sesión en tu cuenta
//           </Text>
//         </View>

//         <View style={{ marginBottom: 30 }}>
//           {/* Email */}
//           <View style={formStyles.inputContainer}>
//             <Ionicons
//               name="mail-outline"
//               size={20}
//               color="#666"
//               style={formStyles.inputIcon}
//             />
//             <TextInput
//               style={formStyles.input}
//               placeholder="Correo electrónico"
//               placeholderTextColor="#999"
//               value={email}
//               onChangeText={setEmail}
//               keyboardType="email-address"
//               autoCapitalize="none"
//             />
//           </View>

//           {/* Password */}
//           <View style={formStyles.inputContainer}>
//             <Ionicons
//               name="lock-closed-outline"
//               size={20}
//               color="#666"
//               style={formStyles.inputIcon}
//             />
//             <TextInput
//               style={formStyles.input}
//               placeholder="Contraseña"
//               placeholderTextColor="#999"
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry={!showPassword}
//             />
//             <TouchableOpacity
//               onPress={() => setShowPassword(!showPassword)}
//               style={formStyles.eyeIcon}
//             >
//               <Ionicons
//                 name={showPassword ? "eye-off-outline" : "eye-outline"}
//                 size={20}
//                 color="#666"
//               />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity style={formStyles.forgotPassword}>
//             <Text style={formStyles.forgotPasswordText}>
//               ¿Olvidaste tu contraseña?
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={formStyles.button}
//             onPress={handleLogin}
//           >
//             <Text style={formStyles.buttonText}>Iniciar sesión</Text>
//           </TouchableOpacity>

//           {/* Social */}
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               marginBottom: 25,
//             }}
//           >
//             <View style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
//             <Text
//               style={{
//                 marginHorizontal: 15,
//                 color: "#666",
//                 fontSize: 14,
//               }}
//             >
//               o continúa con
//             </Text>
//             <View style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
//           </View>

//           <TouchableOpacity
//             style={[formStyles.socialButton, formStyles.googleButton]}
//             onPress={handleGoogle}
//             disabled={!gRequest}
//           >
//             <Ionicons name="logo-google" size={20} color="#DB4437" />
//             <Text style={formStyles.socialButtonText}>Google</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[formStyles.socialButton, formStyles.facebookButton]}
//             onPress={handleFacebook}
//             disabled={!fbRequest}
//           >
//             <Ionicons name="logo-facebook" size={20} color="#4267B2" />
//             <Text style={formStyles.socialButtonText}>Facebook</Text>
//           </TouchableOpacity>
//         </View>

//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "center",
//             marginTop: "auto",
//           }}
//         >
//           <Text style={{ color: "#666", fontSize: 14 }}>
//             ¿No tienes una cuenta?{" "}
//           </Text>
//           <TouchableOpacity onPress={() => router.push("/register")}>
//             <Text
//               style={{
//                 color: "#667eea",
//                 fontSize: 14,
//                 fontWeight: "600",
//               }}
//             >
//               Regístrate
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// frontend/app/login.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { post } from "../src/api";
import { useAuth } from "../src/contexts/auth";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { user, token, loading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const redirectUri = __DEV__
    ? "https://auth.expo.dev/@pandemuerttoo/outfit-lab"
    : AuthSession.makeRedirectUri({ scheme: "outfitlab" });

  const [gRequest, gResponse, gPromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
    scopes: ["profile", "email"],
    redirectUri,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(cardAnim, {
          toValue: 0,
          duration: 700,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 700,
          delay: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [headerAnim, cardAnim, cardOpacity]);

  useEffect(() => {
    if (loading) return;

    if (user && token) {
      router.replace("/(tabs)");
    }
  }, [user, token, loading]);

  useEffect(() => {
    if (gResponse?.type === "success" && gResponse.params?.id_token) {
      handleGoogleWithToken(gResponse.params.id_token);
    }
  }, [gResponse]);

  const goToHome = () => {
    router.replace("/(tabs)");
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      setSending(true);

      const data: any = await post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (!data?.user?.id) {
        throw new Error("Respuesta de login inválida: falta user.id");
      }

      if (!data?.token) {
        throw new Error("Respuesta de login inválida: falta token");
      }

      await login(
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        },
        data.token
      );

      goToHome();
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo iniciar sesión"
      );
    } finally {
      setSending(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await gPromptAsync();
    } catch (e: any) {
      Alert.alert("Google", e?.message || "No se pudo abrir Google");
    }
  };

  const handleGoogleWithToken = async (idToken: string) => {
    try {
      setSending(true);

      const data: any = await post("/auth/google", { idToken });

      if (!data?.user?.id) {
        throw new Error("Respuesta de Google inválida: falta user.id");
      }

      if (!data?.token) {
        throw new Error("Respuesta de Google inválida: falta token");
      }

      await login(
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        },
        data.token
      );

      /**
       * Para login con Google:
       * Si el backend dice que es nuevo, lo mandamos a onboarding.
       * Si ya existía, va directo a home.
       */
      if (data?.isNewUser === true || data?.user?.isNewUser === true) {
        router.replace("/onboarding");
      } else {
        goToHome();
      }
    } catch (e: any) {
      console.error("GOOGLE ERROR:", e);

      Alert.alert(
        "Google",
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Error al autenticar con Google"
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6FA5" />
        <Text style={styles.loadingText}>Cargando sesión...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#4A6FA5", "#8FB8A8", "#A78BFA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Animated.View
              style={[
                styles.headerContent,
                {
                  opacity: headerAnim,
                  transform: [
                    {
                      translateY: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.logoRow}>
                <Ionicons name="sparkles" size={28} color="#FFFFFF" />
                <Text style={styles.logoText}>OutfitLab</Text>
              </View>

              <Text style={styles.subtitle}>Tu moodboard de moda personal</Text>
            </Animated.View>
          </LinearGradient>

          <Animated.View
            style={[
              styles.cardWrapper,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardAnim }],
              },
            ]}
          >
            <View style={styles.card}>
              <View style={styles.toggleContainer}>
                <Pressable style={styles.toggleButton}>
                  <LinearGradient
                    colors={["#4A6FA5", "#8FB8A8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeToggle}
                  >
                    <Text style={styles.activeToggleText}>Iniciar sesión</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => router.push("/register")}
                  style={styles.toggleButton}
                >
                  <Text style={styles.inactiveToggleText}>Registrarse</Text>
                </Pressable>
              </View>

              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>

                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#9CA3AF"
                      style={styles.inputIcon}
                    />

                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="tu@email.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Contraseña</Text>

                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#9CA3AF"
                      style={styles.inputIcon}
                    />

                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                    />

                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#666"
                      />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  onPress={handleLogin}
                  style={styles.submitButtonOuter}
                  disabled={sending}
                >
                  <LinearGradient
                    colors={["#4A6FA5", "#8FB8A8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.submitButton,
                      sending && styles.disabledButton,
                    ]}
                  >
                    {sending ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>Entrar</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>O continuar con</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                style={styles.socialButton}
                onPress={handleGoogle}
                disabled={!gRequest || sending}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.socialButtonText}>Google</Text>
              </Pressable>

              <View style={styles.bottomRow}>
                <Text style={styles.bottomText}>¿No tienes una cuenta? </Text>

                <Pressable onPress={() => router.push("/register")}>
                  <Text style={styles.bottomLink}>Regístrate</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#4A6FA5",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#EEF3F7",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 70,
    paddingBottom: 110,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 38,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  cardWrapper: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#EEF3F7",
    borderRadius: 999,
    padding: 4,
    marginBottom: 28,
  },
  toggleButton: {
    flex: 1,
  },
  activeToggle: {
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  activeToggleText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  inactiveToggleText: {
    textAlign: "center",
    paddingVertical: 12,
    color: "#4B5563",
    fontWeight: "600",
  },
  form: {
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#6B7280",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF3F7",
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#1F2937",
    fontSize: 15,
  },
  submitButtonOuter: {
    marginTop: 4,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  socialButtonText: {
    fontSize: 15,
    color: "#424242",
    fontWeight: "600",
  },
  bottomRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
  },
  bottomText: {
    color: "#666",
    fontSize: 14,
  },
  bottomLink: {
    color: "#4A6FA5",
    fontSize: 14,
    fontWeight: "700",
  },
});