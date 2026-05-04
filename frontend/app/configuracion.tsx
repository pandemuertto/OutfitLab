// frontend/app/configuracion.tsx
// frontend/app/configuracion.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import { api, API_URL } from "../src/api";
import { useAuth } from "../src/contexts/auth";

type Preferences = {
  notifications: boolean;
  weatherSuggestions: boolean;
  publicProfile: boolean;
  favoriteStyles: string[];
};

const DEFAULT_PREFERENCES: Preferences = {
  notifications: true,
  weatherSuggestions: true,
  publicProfile: false,
  favoriteStyles: ["Minimalista", "Elegante", "Casual Chic"],
};

const STYLE_OPTIONS = [
  "Minimalista",
  "Elegante",
  "Casual Chic",
  "Street Style",
  "Vintage",
  "Boho",
  "Deportivo",
  "Romántico",
  "Formal",
  "Urbano",
];

function buildImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

export default function Configuracion() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const [notifications, setNotifications] = useState(
    DEFAULT_PREFERENCES.notifications
  );
  const [weatherSuggestions, setWeatherSuggestions] = useState(
    DEFAULT_PREFERENCES.weatherSuggestions
  );
  const [publicProfile, setPublicProfile] = useState(
    DEFAULT_PREFERENCES.publicProfile
  );
  const [favoriteStyles, setFavoriteStyles] = useState<string[]>(
    DEFAULT_PREFERENCES.favoriteStyles
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const storageKey = user?.id
    ? `outfitlab_settings_${user.id}`
    : "outfitlab_settings_guest";

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  const generateDefaultUsername = (value?: string | null) => {
    if (!value) return "";

    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const loadSettings = async () => {
    try {
      setLoading(true);

      const saved = await AsyncStorage.getItem(storageKey);

      if (saved) {
        const parsed = JSON.parse(saved);

        setName(parsed.name || user?.name || "");
        setUsername(
          parsed.username ||
            generateDefaultUsername(user?.name) ||
            generateDefaultUsername(user?.email) ||
            ""
        );

        setProfilePhotoUrl(
          parsed.profilePhotoUrl || buildImageUrl((user as any)?.avatarUrl)
        );

        setNotifications(
          typeof parsed.notifications === "boolean"
            ? parsed.notifications
            : DEFAULT_PREFERENCES.notifications
        );

        setWeatherSuggestions(
          typeof parsed.weatherSuggestions === "boolean"
            ? parsed.weatherSuggestions
            : DEFAULT_PREFERENCES.weatherSuggestions
        );

        setPublicProfile(
          typeof parsed.publicProfile === "boolean"
            ? parsed.publicProfile
            : DEFAULT_PREFERENCES.publicProfile
        );

        setFavoriteStyles(
          Array.isArray(parsed.favoriteStyles)
            ? parsed.favoriteStyles
            : DEFAULT_PREFERENCES.favoriteStyles
        );
      } else {
        setName(user?.name || "");
        setUsername(
          generateDefaultUsername(user?.name) ||
            generateDefaultUsername(user?.email) ||
            ""
        );

        setProfilePhotoUrl(buildImageUrl((user as any)?.avatarUrl));

        setNotifications(DEFAULT_PREFERENCES.notifications);
        setWeatherSuggestions(DEFAULT_PREFERENCES.weatherSuggestions);
        setPublicProfile(DEFAULT_PREFERENCES.publicProfile);
        setFavoriteStyles(DEFAULT_PREFERENCES.favoriteStyles);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
      Alert.alert("Error", "No se pudo cargar tu configuración.");
    } finally {
      setLoading(false);
    }
  };

  const saveLocalSettings = async (extra?: Partial<any>) => {
    const payload = {
      userId: user?.id,
      name: name.trim(),
      username: username.trim().replace("@", ""),
      profilePhotoUrl,
      notifications,
      weatherSuggestions,
      publicProfile,
      favoriteStyles,
      ...(extra || {}),
    };

    await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
  };

  const pickProfilePhoto = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Debes iniciar sesión para cambiar tu foto.");
      return;
    }

    Alert.alert("Foto de perfil", "Selecciona una opción", [
      {
        text: "Tomar foto",
        onPress: takeProfilePhoto,
      },
      {
        text: "Elegir de galería",
        onPress: chooseProfilePhotoFromGallery,
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  const chooseProfilePhotoFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitas permitir acceso a tus fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      await uploadProfilePhoto(result.assets[0].uri);
    }
  };

  const takeProfilePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitas permitir acceso a la cámara.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      await uploadProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadProfilePhoto = async (imageUri: string) => {
    if (!user?.id) return;

    setUploadingPhoto(true);

    try {
      const formData = new FormData();

      formData.append("userId", String(user.id));

      const filename = imageUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const ext = match?.[1]?.toLowerCase() || "jpg";

      let mime = "image/jpeg";
      if (ext === "png") mime = "image/png";
      if (ext === "webp") mime = "image/webp";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type: mime,
      } as any);

      const resp = await fetch(`${API_URL}/auth/profile-photo`, {
        method: "POST",
        body: formData,
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.error || "No se pudo subir la foto");
      }

      const newAvatarUrl = data?.user?.avatarUrl || imageUri;

      setProfilePhotoUrl(newAvatarUrl);

      await saveLocalSettings({
        profilePhotoUrl: newAvatarUrl,
      });

      Alert.alert("Listo", "Tu foto de perfil se actualizó correctamente.");
    } catch (error) {
      console.error("Error subiendo foto de perfil:", error);
      Alert.alert("Error", "No se pudo actualizar la foto de perfil.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const toggleStyle = (style: string) => {
    setFavoriteStyles((prev) => {
      if (prev.includes(style)) {
        return prev.filter((item) => item !== style);
      }

      return [...prev, style];
    });
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Falta tu nombre", "Escribe un nombre para tu perfil.");
      return false;
    }

    if (!username.trim()) {
      Alert.alert(
        "Falta nombre de usuario",
        "Escribe un nombre de usuario para tu perfil."
      );
      return false;
    }

    if (username.includes(" ")) {
      Alert.alert(
        "Usuario inválido",
        "El nombre de usuario no debe tener espacios."
      );
      return false;
    }

    if (favoriteStyles.length === 0) {
      Alert.alert("Selecciona un estilo", "Elige al menos un estilo favorito.");
      return false;
    }

    return true;
  };

  const saveSettings = async () => {
    if (!validateForm()) return;

    setSaving(true);

    const payload = {
      userId: user?.id,
      name: name.trim(),
      username: username.trim().replace("@", ""),
      profilePhotoUrl,
      notifications,
      weatherSuggestions,
      publicProfile,
      favoriteStyles,
    };

    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(payload));

      try {
        if (user?.id) {
          await api.patch("/auth/profile", {
            userId: user.id,
            name: name.trim(),
          });
        }
      } catch (backendError: any) {
        console.warn(
          "No se pudo guardar en backend, pero sí localmente:",
          backendError?.message
        );
      }

      Alert.alert(
        "Cambios guardados",
        "Tu perfil y preferencias se actualizaron correctamente."
      );
    } catch (error) {
      console.error("Error guardando configuración:", error);
      Alert.alert("Error", "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    Alert.alert(
      "Restablecer preferencias",
      "¿Quieres volver a las preferencias iniciales?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Restablecer",
          style: "destructive",
          onPress: async () => {
            setName(user?.name || "");
            setUsername(
              generateDefaultUsername(user?.name) ||
                generateDefaultUsername(user?.email) ||
                ""
            );
            setProfilePhotoUrl(buildImageUrl((user as any)?.avatarUrl));
            setNotifications(DEFAULT_PREFERENCES.notifications);
            setWeatherSuggestions(DEFAULT_PREFERENCES.weatherSuggestions);
            setPublicProfile(DEFAULT_PREFERENCES.publicProfile);
            setFavoriteStyles(DEFAULT_PREFERENCES.favoriteStyles);

            await AsyncStorage.removeItem(storageKey);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6FA5" />
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#4A6FA5", "#8FB8A8", "#A78BFA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={34} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>
          Edita tu perfil y personaliza tu experiencia
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Perfil</Text>

          <View style={styles.photoSection}>
            <View style={styles.avatarPreview}>
              {profilePhotoUrl ? (
                <Image
                  source={{ uri: profilePhotoUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={48} color="#FFFFFF" />
              )}

              <Pressable
                onPress={pickProfilePhoto}
                disabled={uploadingPhoto}
                style={styles.cameraButton}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                )}
              </Pressable>
            </View>

            <Pressable
              onPress={pickProfilePhoto}
              disabled={uploadingPhoto}
              style={styles.changePhotoButton}
            >
              <Text style={styles.changePhotoText}>
                {uploadingPhoto ? "Subiendo..." : "Cambiar foto de perfil"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Nombre de usuario</Text>
          <View style={styles.usernameInputContainer}>
            <Text style={styles.atSymbol}>@</Text>

            <TextInput
              value={username}
              onChangeText={(value) =>
                setUsername(
                  value
                    .toLowerCase()
                    .replace("@", "")
                    .replace(/\s+/g, "_")
                    .replace(/[^a-z0-9_]/g, "")
                )
              }
              placeholder="usuario"
              placeholderTextColor="#9CA3AF"
              style={styles.usernameInput}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.helpText}>
            Este nombre se mostrará en tu perfil y en secciones compartidas.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mis estilos favoritos</Text>

          <Text style={styles.cardDescription}>
            Selecciona los estilos que más van contigo. Esto puede ayudarte a
            personalizar tus recomendaciones.
          </Text>

          <View style={styles.stylesGrid}>
            {STYLE_OPTIONS.map((style) => {
              const selected = favoriteStyles.includes(style);

              return (
                <Pressable
                  key={style}
                  onPress={() => toggleStyle(style)}
                  style={[
                    styles.styleChip,
                    selected && styles.styleChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.styleChipText,
                      selected && styles.styleChipTextSelected,
                    ]}
                  >
                    {style}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferencias</Text>

          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#4A6FA5"
              />
            </View>

            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Notificaciones</Text>
              <Text style={styles.optionSubtitle}>
                Recibe recordatorios y sugerencias de outfits.
              </Text>
            </View>

            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#CBD5E1", true: "#8FB8A8" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Ionicons
                name="partly-sunny-outline"
                size={22}
                color="#4A6FA5"
              />
            </View>

            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Sugerencias por clima</Text>
              <Text style={styles.optionSubtitle}>
                Usa el clima para recomendarte mejores looks.
              </Text>
            </View>

            <Switch
              value={weatherSuggestions}
              onValueChange={setWeatherSuggestions}
              trackColor={{ false: "#CBD5E1", true: "#8FB8A8" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.optionRow}>
            <View style={styles.optionIcon}>
              <Ionicons name="people-outline" size={22} color="#4A6FA5" />
            </View>

            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Perfil público</Text>
              <Text style={styles.optionSubtitle}>
                Permite que otros usuarios vean tus outfits compartidos.
              </Text>
            </View>

            <Switch
              value={publicProfile}
              onValueChange={setPublicProfile}
              trackColor={{ false: "#CBD5E1", true: "#8FB8A8" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Pressable
          onPress={saveSettings}
          disabled={saving}
          style={styles.saveButtonWrapper}
        >
          <LinearGradient
            colors={["#4A6FA5", "#8FB8A8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButton}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable onPress={resetSettings} style={styles.resetButton}>
          <Ionicons name="refresh-outline" size={18} color="#B91C1C" />
          <Text style={styles.resetButtonText}>Restablecer preferencias</Text>
        </Pressable>
      </View>
    </ScrollView>
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
    fontSize: 14,
    color: "#6B7280",
  },

  container: {
    flex: 1,
    backgroundColor: "#EEF3F7",
  },

  scrollContent: {
    paddingBottom: 60,
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 42,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    top: 58,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    width: 82,
    height: 82,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    marginTop: 6,
    textAlign: "center",
  },

  content: {
    paddingHorizontal: 24,
    marginTop: -22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 14,
  },

  photoSection: {
    alignItems: "center",
    marginBottom: 16,
  },

  avatarPreview: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "#8FB8A8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "visible",
  },

  avatarImage: {
    width: 118,
    height: 118,
    borderRadius: 59,
  },

  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#4A6FA5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  changePhotoButton: {
    backgroundColor: "#EEF3F7",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  changePhotoText: {
    color: "#4A6FA5",
    fontSize: 13,
    fontWeight: "800",
  },

  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4B5563",
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    backgroundColor: "#EEF3F7",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1F2A44",
    marginBottom: 8,
  },

  usernameInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF3F7",
    borderRadius: 18,
    paddingHorizontal: 15,
    marginBottom: 8,
  },

  atSymbol: {
    fontSize: 16,
    fontWeight: "800",
    color: "#4A6FA5",
    marginRight: 3,
  },

  usernameInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1F2A44",
  },

  helpText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 4,
  },

  stylesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  styleChip: {
    borderWidth: 1.3,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 10,
  },

  styleChipSelected: {
    borderColor: "#4A6FA5",
    backgroundColor: "rgba(74,111,165,0.12)",
  },

  styleChipText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },

  styleChipTextSelected: {
    color: "#4A6FA5",
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2A44",
  },

  optionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
    lineHeight: 17,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
  },

  saveButtonWrapper: {
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 4,
  },

  saveButton: {
    paddingVertical: 15,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  resetButton: {
    marginTop: 14,
    marginBottom: 20,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "rgba(185,28,28,0.08)",
    borderWidth: 1,
    borderColor: "rgba(185,28,28,0.25)",
  },

  resetButtonText: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
});