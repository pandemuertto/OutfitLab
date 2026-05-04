// import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import profileStyles from '../../src/styles/profile';
// import { router } from "expo-router";
// import { useState } from "react";
// import { useAuth } from "../../src/contexts/auth";

// export default function ProfileScreen() {
//   const { user, logout } = useAuth();
//   const [stats] = useState({ prendas: 0, outfits: 0 });

//   console.log('👤 Perfil - usuario actual:', user); // 👈 Ver qué usuario hay

//   const handleLogout = async () => {
//     console.log('🚪 Iniciando proceso de logout...'); // 👈 Log 1
    
//     Alert.alert(
//       "Cerrar Sesión",
//       "¿Estás seguro de que quieres cerrar sesión?",
//       [
//         { text: "Cancelar", style: "cancel" },
//         {
//           text: "Sí, cerrar sesión",
//           onPress: async () => {
//             console.log('✅ Usuario confirmó logout'); // 👈 Log 2
//             try {
//               console.log('📤 Llamando a logout() del contexto...'); // 👈 Log 3
//               await logout();
//               console.log('🔄 Logout completado, redirigiendo...'); // 👈 Log 4
//               router.replace("/login");
//               console.log('🎯 Redirección ejecutada'); // 👈 Log 5
//             } catch (error) {
//               console.error('❌ Error en logout:', error);
//               Alert.alert("Error", "No se pudo cerrar la sesión");
//             }
//           }
//         }
//       ]
//     );
//   };

//   return (
//     <ScrollView style={profileStyles.container}>
//       {/* Header con foto de perfil */}
//       <View style={profileStyles.profileImageContainer}>
//         <View style={profileStyles.avatarPlaceholder}>
//           <Ionicons name="person" size={40} color="#666" />
//         </View>
//         <TouchableOpacity style={profileStyles.editImageButton}>
//           <Ionicons name="camera" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Información del usuario */}
//       <View style={{ alignItems: 'center', marginBottom: 20 }}>
//         <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>
//           {user?.name || 'Usuario'}
//         </Text>
//         <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
//           {user?.email || 'usuario@example.com'}
//         </Text>
//       </View>

//       {/* Estadísticas */}
//       <View style={profileStyles.statsContainer}>
//         <View style={profileStyles.statItem}>
//           <Text style={profileStyles.statNumber}>{stats.prendas}</Text>
//           <Text style={profileStyles.statLabel}>Prendas</Text>
//         </View>
//         <View style={[profileStyles.statItem, profileStyles.statBorder]}>
//           <Text style={profileStyles.statNumber}>{stats.outfits}</Text>
//           <Text style={profileStyles.statLabel}>Outfits</Text>
//         </View>
//       </View>

//       {/* Menú de opciones */}
//       <View style={profileStyles.menuContainer}>
//         <TouchableOpacity style={profileStyles.menuItem}>
//           <View style={profileStyles.menuItemContent}>
//             <Ionicons name="person-outline" size={24} color="#333" />
//             <Text style={profileStyles.menuItemText}>Editar Perfil</Text>
//           </View>
//           <Ionicons name="chevron-forward" size={24} color="#ccc" />
//         </TouchableOpacity>

//         <TouchableOpacity style={profileStyles.menuItem}>
//           <View style={profileStyles.menuItemContent}>
//             <Ionicons name="notifications-outline" size={24} color="#333" />
//             <Text style={profileStyles.menuItemText}>Notificaciones</Text>
//           </View>
//           <Ionicons name="chevron-forward" size={24} color="#ccc" />
//         </TouchableOpacity>

//         <TouchableOpacity style={profileStyles.menuItem}>
//           <View style={profileStyles.menuItemContent}>
//             <Ionicons name="lock-closed-outline" size={24} color="#333" />
//             <Text style={profileStyles.menuItemText}>Privacidad</Text>
//           </View>
//           <Ionicons name="chevron-forward" size={24} color="#ccc" />
//         </TouchableOpacity>

//         <TouchableOpacity style={profileStyles.menuItem}>
//           <View style={profileStyles.menuItemContent}>
//             <Ionicons name="help-circle-outline" size={24} color="#333" />
//             <Text style={profileStyles.menuItemText}>Ayuda y Soporte</Text>
//           </View>
//           <Ionicons name="chevron-forward" size={24} color="#ccc" />
//         </TouchableOpacity>

//         {/* Botón de Cerrar Sesión */}
//         <TouchableOpacity style={profileStyles.menuItem} onPress={handleLogout}>
//           <View style={profileStyles.menuItemContent}>
//             <Ionicons name="log-out-outline" size={24} color="#ff4444" />
//             <Text style={[profileStyles.menuItemText, { color: "#ff4444" }]}>Cerrar Sesión</Text>
//           </View>
//           <Ionicons name="chevron-forward" size={24} color="#ccc" />
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// frontend/app/(tabs)/perfil.tsx
// frontend/app/(tabs)/perfil.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL, get } from "../../src/api";
import { useAuth } from "../../src/contexts/auth";

type ClothingItem = {
  id: number;
  imageUrl: string;
  type?: string | null;
  color?: string | null;
  category?: string | null;
};

type OutfitItemDB = {
  prenda: ClothingItem;
};

type OutfitDB = {
  id: string;
  name?: string | null;
  occasion?: string | null;
  dressCode?: string | null;
  weather?: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  items: OutfitItemDB[];
};

type LocalSettings = {
  userId?: string;
  name?: string;
  username?: string;
  profilePhotoUrl?: string | null;
  notifications?: boolean;
  weatherSuggestions?: boolean;
  publicProfile?: boolean;
  favoriteStyles?: string[];
};

function buildImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

function normalizeUsername(value?: string | null) {
  if (!value) return "usuario";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace("@", "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"outfits" | "guardados">(
    "outfits"
  );

  const [savedOutfits, setSavedOutfits] = useState<OutfitDB[]>([]);
  const [clothesCount, setClothesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [profileName, setProfileName] = useState(user?.name || "Usuario");
  const [profileUsername, setProfileUsername] = useState(
    normalizeUsername(user?.name || user?.email)
  );
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const [favoriteStyles, setFavoriteStyles] = useState<string[]>([
    "Minimalista",
    "Elegante",
    "Casual Chic",
    "Street Style",
  ]);

  const displayEmail = user?.email?.trim() || "usuario@example.com";

  const storageKey = user?.id
    ? `outfitlab_settings_${user.id}`
    : "outfitlab_settings_guest";

  const loadLocalSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);

      if (!saved) {
        setProfileName(user?.name || "Usuario");
        setProfileUsername(normalizeUsername(user?.name || user?.email));
        setProfilePhotoUrl(buildImageUrl((user as any)?.avatarUrl));

        setFavoriteStyles([
          "Minimalista",
          "Elegante",
          "Casual Chic",
          "Street Style",
        ]);

        return;
      }

      const parsed: LocalSettings = JSON.parse(saved);

      setProfileName(parsed.name?.trim() || user?.name || "Usuario");

      setProfileUsername(
        normalizeUsername(
          parsed.username || user?.name || user?.email || "usuario"
        )
      );

      setProfilePhotoUrl(
        parsed.profilePhotoUrl || buildImageUrl((user as any)?.avatarUrl)
      );

      setFavoriteStyles(
        Array.isArray(parsed.favoriteStyles) && parsed.favoriteStyles.length > 0
          ? parsed.favoriteStyles
          : ["Minimalista", "Elegante", "Casual Chic", "Street Style"]
      );
    } catch (error) {
      console.error("Error leyendo configuración local:", error);
    }
  };

  const loadProfileData = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      await loadLocalSettings();

      const [clothesResponse, outfitsResponse] = await Promise.all([
        get(`/api/clothes/user/${user.id}`),
        get(`/api/outfits/user/${user.id}`),
      ]);

      const clothes = Array.isArray(clothesResponse)
        ? clothesResponse
        : clothesResponse?.prendas || clothesResponse?.items || [];

      const outfits = Array.isArray(outfitsResponse)
        ? outfitsResponse
        : outfitsResponse?.outfits || outfitsResponse?.items || [];

      setClothesCount(clothes.length);
      setSavedOutfits(outfits);
    } catch (err) {
      console.error("Error cargando perfil:", err);

      Alert.alert(
        "Error",
        "No se pudo actualizar tu perfil. Revisa que el backend esté corriendo."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [user?.id])
  );

  const getOutfitThumbnail = (outfit: OutfitDB): string | null => {
    if (outfit.photoUrl) return buildImageUrl(outfit.photoUrl);

    const first = outfit.items?.[0]?.prenda;

    if (!first?.imageUrl) return null;

    return buildImageUrl(first.imageUrl);
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir de tu cuenta?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (error) {
            console.error("Error cerrando sesión:", error);
          }
        },
      },
    ]);
  };

  const stats = [
    {
      label: "Prendas",
      value: String(clothesCount),
      icon: "sparkles-outline" as const,
    },
    {
      label: "Outfits",
      value: String(savedOutfits.length),
      icon: "grid-outline" as const,
    },
    {
      label: "Guardados",
      value: String(savedOutfits.length),
      icon: "heart-outline" as const,
    },
  ];

  const menuItems = [
    {
      icon: "people-outline" as const,
      label: "Armario compartido",
      description: "Comparte y descubre outfits",
      color: "#4A6FA5",
      bg: "rgba(74,111,165,0.10)",
      onPress: () => router.push("/armario-compartido" as any),
    },
    {
      icon: "settings-outline" as const,
      label: "Configuración",
      description: "Editar perfil y preferencias",
      color: "#4A6FA5",
      bg: "rgba(74,111,165,0.10)",
      onPress: () => router.push("/configuracion" as any),
    },
    {
      icon: "help-circle-outline" as const,
      label: "Ayuda y soporte",
      description: "Centro de ayuda",
      color: "#4A6FA5",
      bg: "rgba(74,111,165,0.10)",
      onPress: () => router.push("/ayuda" as any),
    },
    {
      icon: "log-out-outline" as const,
      label: "Cerrar sesión",
      description: "Salir de tu cuenta",
      color: "#EF4444",
      bg: "rgba(239,68,68,0.10)",
      danger: true,
      onPress: handleLogout,
    },
  ];

  const renderOutfitGrid = (data: OutfitDB[]) => {
    if (loading) {
      return (
        <View style={styles.emptyGridCard}>
          <ActivityIndicator size="small" color="#4A6FA5" />
          <Text style={styles.emptyGridTitle}>Actualizando perfil...</Text>
          <Text style={styles.emptyGridText}>
            Estamos cargando tus prendas y outfits.
          </Text>
        </View>
      );
    }

    if (data.length === 0) {
      return (
        <View style={styles.emptyGridCard}>
          <Ionicons name="images-outline" size={38} color="#AAB7C4" />

          <Text style={styles.emptyGridTitle}>
            {activeTab === "outfits"
              ? "Aún no hay outfits"
              : "Aún no hay guardados"}
          </Text>

          <Text style={styles.emptyGridText}>
            {activeTab === "outfits"
              ? "Genera o guarda tus outfits para verlos aquí."
              : "Guarda tus looks favoritos para tenerlos a la mano."}
          </Text>

          <Pressable
            style={styles.emptyActionButton}
            onPress={() => router.push("/(tabs)/outfits" as any)}
          >
            <Text style={styles.emptyActionText}>Ir a outfits</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.grid}>
        {data.map((outfit, index) => {
          const thumbnail = getOutfitThumbnail(outfit);

          return (
            <Pressable
              key={outfit.id}
              style={[
                styles.outfitCard,
                index % 3 === 0 && styles.outfitCardTall,
              ]}
              onPress={() => router.push("/(tabs)/outfits" as any)}
            >
              <View style={styles.outfitImageWrapper}>
                {thumbnail ? (
                  <Image
                    source={{ uri: thumbnail }}
                    style={styles.outfitImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.outfitImage, styles.outfitPlaceholder]}>
                    <Ionicons name="image-outline" size={28} color="#94A3B8" />
                  </View>
                )}

                <LinearGradient
                  colors={["transparent", "rgba(15,23,42,0.68)"]}
                  style={styles.outfitOverlay}
                />

                <View style={styles.outfitInfoOverlay}>
                  <Text style={styles.outfitTitle} numberOfLines={1}>
                    {outfit.name || "Outfit sugerido"}
                  </Text>

                  <Text style={styles.outfitMeta}>
                    {outfit.items?.length || 0} prendas
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const tabData = activeTab === "outfits" ? savedOutfits : savedOutfits;

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
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            {profilePhotoUrl ? (
              <Image
                source={{ uri: profilePhotoUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={48} color="#FFFFFF" />
            )}
          </View>

          <Text style={styles.name}>{profileName}</Text>
          <Text style={styles.username}>@{profileUsername}</Text>
          <Text style={styles.email}>{displayEmail}</Text>

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <View style={styles.statTopRow}>
                  <Ionicons
                    name={stat.icon}
                    size={17}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>

                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.stylesCard}>
          <View style={styles.stylesTitleRow}>
            <Text style={styles.stylesCardTitle}>Mis estilos favoritos</Text>

            <Pressable
              onPress={() => router.push("/configuracion" as any)}
              style={styles.editStylesButton}
            >
              <Ionicons name="create-outline" size={16} color="#4A6FA5" />
              <Text style={styles.editStylesText}>Editar</Text>
            </Pressable>
          </View>

          <View style={styles.stylesTags}>
            {favoriteStyles.map((style) => (
              <View key={style} style={styles.styleTag}>
                <Text style={styles.styleTagText}>{style}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setActiveTab("outfits")}
            style={styles.tabButton}
          >
            {activeTab === "outfits" ? (
              <LinearGradient
                colors={["#4A6FA5", "#8FB8A8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTab}
              >
                <Text style={styles.activeTabText}>Mis Outfits</Text>
              </LinearGradient>
            ) : (
              <View style={styles.inactiveTab}>
                <Text style={styles.inactiveTabText}>Mis Outfits</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("guardados")}
            style={styles.tabButton}
          >
            {activeTab === "guardados" ? (
              <LinearGradient
                colors={["#4A6FA5", "#8FB8A8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTab}
              >
                <Text style={styles.activeTabText}>Guardados</Text>
              </LinearGradient>
            ) : (
              <View style={styles.inactiveTab}>
                <Text style={styles.inactiveTabText}>Guardados</Text>
              </View>
            )}
          </Pressable>
        </View>

        {renderOutfitGrid(tabData)}

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={[
                styles.menuItem,
                index !== menuItems.length - 1 && styles.menuDivider,
              ]}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: item.bg },
                ]}
              >
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>

              <View style={styles.menuTextContainer}>
                <Text
                  style={[
                    styles.menuLabel,
                    item.danger && styles.menuLabelDanger,
                  ]}
                >
                  {item.label}
                </Text>

                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3F7",
  },

  scrollContent: {
    paddingBottom: 120,
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 70,
  },

  headerContent: {
    alignItems: "center",
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
  },

  name: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  username: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },

  email: {
    fontSize: 14,
    color: "rgba(255,255,255,0.82)",
    marginTop: 3,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 30,
    width: "100%",
    justifyContent: "space-around",
  },

  statItem: {
    alignItems: "center",
    flex: 1,
  },

  statTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginLeft: 6,
  },

  statLabel: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
  },

  content: {
    paddingHorizontal: 24,
    marginTop: -38,
  },

  stylesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    marginBottom: 22,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  stylesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  stylesCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4B5563",
  },

  editStylesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF3F7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  editStylesText: {
    color: "#4A6FA5",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 4,
  },

  stylesTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  styleTag: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },

  styleTagText: {
    color: "#4A6FA5",
    fontSize: 13,
    fontWeight: "700",
  },

  tabsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  tabButton: {
    flex: 1,
  },

  activeTab: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    marginRight: 8,
  },

  activeTabText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  inactiveTab: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  inactiveTabText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "800",
  },

  emptyGridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 38,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 24,
  },

  emptyGridTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2A44",
    marginTop: 14,
    textAlign: "center",
  },

  emptyGridText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },

  emptyActionButton: {
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    paddingHorizontal: 20,
    paddingVertical: 11,
  },

  emptyActionText: {
    color: "#4A6FA5",
    fontSize: 13,
    fontWeight: "800",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  outfitCard: {
    width: "48%",
    marginBottom: 14,
  },

  outfitCardTall: {
    width: "100%",
  },

  outfitImageWrapper: {
    height: 210,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  outfitImage: {
    width: "100%",
    height: "100%",
  },

  outfitPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },

  outfitOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  outfitInfoOverlay: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },

  outfitTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  outfitMeta: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    marginTop: 2,
  },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  menuTextContainer: {
    flex: 1,
  },

  menuLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2A44",
  },

  menuLabelDanger: {
    color: "#EF4444",
  },

  menuDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },
});