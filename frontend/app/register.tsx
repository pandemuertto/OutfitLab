// import { post } from "../src/api";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
//   Modal,
//   StyleSheet,
// } from "react-native";
// import * as AuthSession from "expo-auth-session";
// import * as WebBrowser from "expo-web-browser";
// import * as Google from "expo-auth-session/providers/google";
// import { LinearGradient } from "expo-linear-gradient";

// WebBrowser.maybeCompleteAuthSession();

// const palette = {
//   bg: "#EEF3F7",
//   card: "#FFFFFF",
//   text: "#1F2A44",
//   muted: "#6B7280",
//   lightMuted: "#9CA3AF",
//   border: "#E5E7EB",
//   inputBg: "#EEF3F7",
//   primary: "#4A6FA5",
//   secondary: "#8FB8A8",
//   accent: "#A78BFA",
// };

// export default function RegisterScreen() {
//   const [formData, setFormData] = useState({
//     nombre: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   const handleChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const redirectUri = __DEV__
//     ? "http://localhost:8081/auth"
//     : AuthSession.makeRedirectUri({ scheme: "outfitlab", path: "auth" });

//   const [gRequest, gResponse, gPromptAsync] = Google.useAuthRequest({
//     clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
//     scopes: ["profile", "email"],
//     redirectUri,
//   });

//   useEffect(() => {
//     if (gResponse?.type === "success") {
//       const idToken = gResponse.params?.id_token;
//       if (idToken) {
//         handleGoogleWithToken(idToken);
//       }
//     } else if (gResponse?.type === "error") {
//       Alert.alert("Error", "No se pudo autenticar con Google");
//     }
//   }, [gResponse]);

//   const handleGoogleWithToken = async (idToken: string) => {
//     setIsLoading(true);
//     try {
//       const data = await post("/auth/google", { idToken });

//       if (data?.token) {
//         setShowSuccessModal(true);
//         setTimeout(() => {
//           setShowSuccessModal(false);
//           router.push("/login");
//         }, 2000);
//       } else {
//         Alert.alert("Error", data?.error || "No se pudo registrar con Google");
//       }
//     } catch (e: any) {
//       console.error("❌ Error Google:", e);
//       Alert.alert("Error", e?.message || "Fallo al conectar con Google");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRegister = async () => {
//     if (
//       !formData.nombre ||
//       !formData.email ||
//       !formData.password ||
//       !formData.confirmPassword
//     ) {
//       Alert.alert("Error", "Por favor completa todos los campos");
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       Alert.alert("Error", "Las contraseñas no coinciden");
//       return;
//     }

//     if (formData.password.length < 6) {
//       Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const data = await post("/auth/register", {
//         email: formData.email,
//         password: formData.password,
//         name: formData.nombre,
//       });

//       if (data?.success) {
//         setShowSuccessModal(true);
//         setFormData({
//           nombre: "",
//           email: "",
//           password: "",
//           confirmPassword: "",
//         });

//         setTimeout(() => {
//           setShowSuccessModal(false);
//           router.push("/login");
//         }, 2000);
//       } else {
//         Alert.alert("Error", data?.error || "Error al crear la cuenta");
//       }
//     } catch (err: any) {
//       console.error("❌ Error registro:", err);
//       Alert.alert(
//         "Error",
//         err?.response?.data?.error ||
//           err?.message ||
//           "No se pudo conectar con el servidor"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: palette.bg }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         showsVerticalScrollIndicator={false}
//       >
//         <LinearGradient
//           colors={[palette.primary, palette.secondary, palette.accent]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.hero}
//         >
//           <View style={styles.logoRow}>
//             <Ionicons name="sparkles" size={26} color="#FFFFFF" />
//             <Text style={styles.logoText}>OutfitLab</Text>
//           </View>
//           <Text style={styles.heroSubtitle}>
//             Tu moodboard de moda personal
//           </Text>

//           <View style={styles.circleTop} />
//           <View style={styles.circleBottom} />
//         </LinearGradient>

//         <View style={styles.card}>
//           <View style={styles.toggleContainer}>
//             <TouchableOpacity
//               style={styles.toggleInactive}
//               onPress={() => router.push("/login")}
//               disabled={isLoading}
//             >
//               <Text style={styles.toggleInactiveText}>Iniciar sesión</Text>
//             </TouchableOpacity>

//             <LinearGradient
//               colors={[palette.primary, palette.secondary]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               style={styles.toggleActive}
//             >
//               <Text style={styles.toggleActiveText}>Registrarse</Text>
//             </LinearGradient>
//           </View>

//           <View style={styles.formBlock}>
//             <Text style={styles.label}>NOMBRE COMPLETO</Text>
//             <View style={styles.inputContainer}>
//               <Ionicons
//                 name="person-outline"
//                 size={22}
//                 color={palette.lightMuted}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Tu nombre completo"
//                 placeholderTextColor={palette.lightMuted}
//                 value={formData.nombre}
//                 onChangeText={(t) => handleChange("nombre", t)}
//                 editable={!isLoading}
//               />
//             </View>

//             <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
//             <View style={styles.inputContainer}>
//               <Ionicons
//                 name="mail-outline"
//                 size={22}
//                 color={palette.lightMuted}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="tu@email.com"
//                 placeholderTextColor={palette.lightMuted}
//                 value={formData.email}
//                 onChangeText={(t) => handleChange("email", t)}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 editable={!isLoading}
//               />
//             </View>

//             <Text style={styles.label}>CONTRASEÑA</Text>
//             <View style={styles.inputContainer}>
//               <Ionicons
//                 name="lock-closed-outline"
//                 size={22}
//                 color={palette.lightMuted}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="••••••••"
//                 placeholderTextColor={palette.lightMuted}
//                 value={formData.password}
//                 onChangeText={(t) => handleChange("password", t)}
//                 secureTextEntry={!showPassword}
//                 editable={!isLoading}
//               />
//               <TouchableOpacity
//                 onPress={() => setShowPassword(!showPassword)}
//                 style={styles.eyeIcon}
//                 disabled={isLoading}
//               >
//                 <Ionicons
//                   name={showPassword ? "eye-off-outline" : "eye-outline"}
//                   size={22}
//                   color={palette.muted}
//                 />
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
//             <View style={styles.inputContainer}>
//               <Ionicons
//                 name="lock-closed-outline"
//                 size={22}
//                 color={palette.lightMuted}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="••••••••"
//                 placeholderTextColor={palette.lightMuted}
//                 value={formData.confirmPassword}
//                 onChangeText={(t) => handleChange("confirmPassword", t)}
//                 secureTextEntry={!showConfirmPassword}
//                 editable={!isLoading}
//               />
//               <TouchableOpacity
//                 onPress={() =>
//                   setShowConfirmPassword(!showConfirmPassword)
//                 }
//                 style={styles.eyeIcon}
//                 disabled={isLoading}
//               >
//                 <Ionicons
//                   name={
//                     showConfirmPassword ? "eye-off-outline" : "eye-outline"
//                   }
//                   size={22}
//                   color={palette.muted}
//                 />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.termsBlock}>
//               <Text style={styles.termsText}>
//                 Al registrarte, aceptas nuestros{" "}
//                 <Text style={styles.linkText}>Términos de servicio</Text> y{" "}
//                 <Text style={styles.linkText}>Política de privacidad</Text>
//               </Text>
//             </View>

//             <TouchableOpacity
//               onPress={handleRegister}
//               disabled={isLoading}
//               style={{ marginTop: 6 }}
//             >
//               <LinearGradient
//                 colors={[palette.primary, palette.secondary]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={[styles.mainButton, isLoading && { opacity: 0.7 }]}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator color="#FFFFFF" />
//                 ) : (
//                   <Text style={styles.mainButtonText}>Crear cuenta</Text>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>

//             <View style={styles.separatorRow}>
//               <View style={styles.separatorLine} />
//               <Text style={styles.separatorText}>O continuar con</Text>
//               <View style={styles.separatorLine} />
//             </View>

//             <TouchableOpacity
//               style={[
//                 styles.socialButton,
//                 isLoading && { opacity: 0.6 },
//               ]}
//               disabled={!gRequest || isLoading}
//               onPress={() => gPromptAsync()}
//             >
//               <Ionicons name="logo-google" size={24} color="#DB4437" />
//               <Text style={styles.socialButtonText}>Google</Text>
//             </TouchableOpacity>

//             <View style={styles.footerRow}>
//               <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
//               <TouchableOpacity
//                 onPress={() => router.push("/login")}
//                 disabled={isLoading}
//               >
//                 <Text style={styles.footerLink}>Inicia sesión</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </ScrollView>

//       <Modal
//         visible={showSuccessModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowSuccessModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Ionicons
//               name="checkmark-circle"
//               size={60}
//               color="#4CAF50"
//             />
//             <Text style={styles.modalTitle}>¡Cuenta creada exitosamente!</Text>
//             <Text style={styles.modalText}>
//               Serás redirigido al login...
//             </Text>
//             <ActivityIndicator
//               size="small"
//               color={palette.primary}
//               style={{ marginTop: 15 }}
//             />
//           </View>
//         </View>
//       </Modal>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   scroll: {
//     flexGrow: 1,
//     paddingBottom: 40,
//   },
//   hero: {
//     paddingTop: 68,
//     paddingBottom: 96,
//     paddingHorizontal: 24,
//     alignItems: "center",
//     position: "relative",
//     overflow: "hidden",
//   },
//   logoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 14,
//     zIndex: 2,
//   },
//   logoText: {
//     color: "#FFFFFF",
//     fontSize: 42,
//     fontWeight: "700",
//     marginLeft: 10,
//   },
//   heroSubtitle: {
//     color: "rgba(255,255,255,0.92)",
//     fontSize: 16,
//     textAlign: "center",
//     zIndex: 2,
//   },
//   circleTop: {
//     position: "absolute",
//     top: -40,
//     right: -30,
//     width: 190,
//     height: 190,
//     borderRadius: 95,
//     backgroundColor: "rgba(255,255,255,0.10)",
//   },
//   circleBottom: {
//     position: "absolute",
//     bottom: -60,
//     left: -40,
//     width: 170,
//     height: 170,
//     borderRadius: 85,
//     backgroundColor: "rgba(255,255,255,0.10)",
//   },
//   card: {
//     backgroundColor: palette.card,
//     marginHorizontal: 24,
//     marginTop: -52,
//     borderRadius: 32,
//     padding: 18,
//     shadowColor: "#1F2A44",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.12,
//     shadowRadius: 16,
//     elevation: 8,
//   },
//   toggleContainer: {
//     flexDirection: "row",
//     backgroundColor: palette.inputBg,
//     borderRadius: 999,
//     padding: 8,
//     marginBottom: 26,
//   },
//   toggleActive: {
//     flex: 1,
//     borderRadius: 999,
//     paddingVertical: 15,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   toggleInactive: {
//     flex: 1,
//     borderRadius: 999,
//     paddingVertical: 15,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   toggleActiveText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   toggleInactiveText: {
//     color: "#4B5563",
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   formBlock: {
//     marginTop: 2,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: palette.muted,
//     letterSpacing: 2,
//     marginBottom: 10,
//     marginTop: 6,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: palette.inputBg,
//     borderRadius: 24,
//     paddingHorizontal: 18,
//     minHeight: 68,
//     marginBottom: 16,
//   },
//   inputIcon: {
//     marginRight: 14,
//   },
//   input: {
//     flex: 1,
//     fontSize: 18,
//     color: palette.text,
//   },
//   eyeIcon: {
//     paddingLeft: 10,
//     paddingVertical: 6,
//   },
//   termsBlock: {
//     marginBottom: 18,
//     marginTop: 4,
//   },
//   termsText: {
//     fontSize: 13,
//     color: palette.muted,
//     textAlign: "center",
//     lineHeight: 20,
//   },
//   linkText: {
//     color: palette.primary,
//     fontWeight: "700",
//   },
//   mainButton: {
//     minHeight: 64,
//     borderRadius: 999,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 22,
//   },
//   mainButtonText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   separatorRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 22,
//   },
//   separatorLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: "#D8DCE3",
//   },
//   separatorText: {
//     marginHorizontal: 16,
//     color: palette.muted,
//     fontSize: 14,
//   },
//   socialButton: {
//     minHeight: 64,
//     borderRadius: 22,
//     borderWidth: 1.2,
//     borderColor: palette.border,
//     backgroundColor: "#FFFFFF",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 22,
//   },
//   socialButtonText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#2F3440",
//     marginLeft: 12,
//   },
//   footerRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   footerText: {
//     color: palette.muted,
//     fontSize: 15,
//   },
//   footerLink: {
//     color: palette.primary,
//     fontSize: 15,
//     fontWeight: "700",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   modalContent: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 24,
//     padding: 28,
//     alignItems: "center",
//     width: "84%",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#333",
//     marginTop: 15,
//     textAlign: "center",
//   },
//   modalText: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 5,
//     textAlign: "center",
//   },
// });

//frontend/app/register.tsx
// frontend/app/register.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
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

export default function RegisterScreen() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(40)).current;

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
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        delay: 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        delay: 120,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, headerTranslateY, cardOpacity, cardTranslateY]);

  useEffect(() => {
    if (gResponse?.type === "success" && gResponse.params?.id_token) {
      handleGoogleWithToken(gResponse.params.id_token);
    }
  }, [gResponse]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goToOnboarding = () => {
    router.replace("/onboarding");
  };

  const saveSessionAndGoToOnboarding = async (data: any) => {
    if (!data?.user?.id) {
      throw new Error("Respuesta inválida: falta user.id");
    }

    if (!data?.token) {
      throw new Error("Respuesta inválida: falta token");
    }

    await login(
      {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      },
      data.token
    );

    goToOnboarding();
  };

  const handleRegister = async () => {
    if (
      !formData.nombre.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
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

    try {
      setIsLoading(true);

      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      const registerData: any = await post("/auth/register", {
        email,
        password,
        name: formData.nombre.trim(),
      });

      /**
       * Caso ideal:
       * El backend responde con user + token.
       */
      if (registerData?.user?.id && registerData?.token) {
        await saveSessionAndGoToOnboarding(registerData);
        return;
      }

      /**
       * Respaldo:
       * Si tu backend crea la cuenta pero NO devuelve token,
       * hacemos login automático para obtener el token.
       */
      const loginData: any = await post("/auth/login", {
        email,
        password,
      });

      await saveSessionAndGoToOnboarding(loginData);
    } catch (err: any) {
      console.error("❌ Error registro:", err);

      Alert.alert(
        "Error",
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear la cuenta"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await gPromptAsync();
    } catch (e: any) {
      Alert.alert("Google", e?.message || "No se pudo abrir Google");
    }
  };

  const handleGoogleWithToken = async (idToken: string) => {
    try {
      setIsLoading(true);

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
       * Si Google creó usuario nuevo, onboarding.
       * Si Google era usuario existente, home.
       */
      if (data?.isNewUser === true || data?.user?.isNewUser === true) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      console.error("❌ Error Google:", e);

      Alert.alert(
        "Error",
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Fallo al conectar con Google"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <View style={styles.logoRow}>
              <Ionicons name="sparkles" size={26} color="#FFFFFF" />
              <Text style={styles.logoText}>OutfitLab</Text>
            </View>

            <Text style={styles.subtitle}>Crea tu cuenta y descubre tu estilo</Text>
          </Animated.View>
        </LinearGradient>

        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          <View style={styles.card}>
            <View style={styles.toggleContainer}>
              <Pressable
                onPress={() => router.push("/login")}
                style={styles.toggleButton}
              >
                <Text style={styles.inactiveToggleText}>Iniciar sesión</Text>
              </Pressable>

              <Pressable style={styles.toggleButton}>
                <LinearGradient
                  colors={["#4A6FA5", "#8FB8A8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeToggle}
                >
                  <Text style={styles.activeToggleText}>Registrarse</Text>
                </LinearGradient>
              </Pressable>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombre</Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    value={formData.nombre}
                    onChangeText={(value) => handleChange("nombre", value)}
                    placeholder="Tu nombre"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>
              </View>

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
                    value={formData.email}
                    onChangeText={(value) => handleChange("email", value)}
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
                    value={formData.password}
                    onChangeText={(value) => handleChange("password", value)}
                    placeholder="Mínimo 6 caracteres"
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

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirmar contraseña</Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      handleChange("confirmPassword", value)
                    }
                    placeholder="Repite tu contraseña"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                  />

                  <Pressable
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color="#666"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={handleRegister}
                style={styles.submitButtonOuter}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#4A6FA5", "#8FB8A8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.submitButton,
                    isLoading && styles.disabledButton,
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Crear cuenta
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O registrarte con</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={styles.socialButton}
              onPress={handleGoogleRegister}
              disabled={!gRequest || isLoading}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </Pressable>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>¿Ya tienes una cuenta? </Text>

              <Pressable onPress={() => router.push("/login")}>
                <Text style={styles.bottomLink}>Inicia sesión</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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