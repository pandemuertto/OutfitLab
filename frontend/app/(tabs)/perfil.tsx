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

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

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
  items: OutfitItemDB[];
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"outfits" | "guardados">("outfits");
  const [savedOutfits, setSavedOutfits] = useState<OutfitDB[]>([]);
  const [clothesCount, setClothesCount] = useState(0);

  const displayName = user?.name?.trim() || "Usuario";
  const displayEmail = user?.email?.trim() || "usuario@example.com";

  const username = useMemo(() => {
    if (!displayName) return "@usuario";
    return "@" + displayName.toLowerCase().replace(/\s+/g, "_");
  }, [displayName]);

  const favoriteStyles = ["Minimalista", "Elegante", "Casual Chic", "Street Style"];

  const loadSavedOutfits = async () => {
    try {
      if (!user?.id) return;
      const response = await get(`/api/outfits/user/${user.id}`);
      setSavedOutfits(response.outfits || []);
    } catch (err) {
      console.error("Error cargando outfits guardados:", err);
    }
  };

  const loadClothesCount = async () => {
    try {
      if (!user?.id) return;
      const response = await fetch(`${API_URL}/api/clothes/user/${user.id}`);
      const data = await response.json();
      const clothes = Array.isArray(data) ? data : [];
      setClothesCount(clothes.length);
    } catch (err) {
      console.error("Error cargando prendas:", err);
      setClothesCount(0);
    }
  };

  useEffect(() => {
    loadSavedOutfits();
    loadClothesCount();
  }, [user?.id]);

  const getOutfitThumbnail = (o: OutfitDB): string | null => {
    if (o.photoUrl) {
      if (o.photoUrl.startsWith("http")) return o.photoUrl;
      return `${API_URL}${o.photoUrl}`;
    }

    const first = o.items?.[0]?.prenda;
    if (!first?.imageUrl) return null;

    if (first.imageUrl.startsWith("http")) return first.imageUrl;
    return `${API_URL}${first.imageUrl}`;
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (error) {
            console.error("Error during logout:", error);
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
      icon: "settings-outline" as const,
      label: "Configuración",
      description: "Preferencias de la app",
      onPress: () => Alert.alert("Próximamente", "Configuración aún no disponible."),
    },
    {
      icon: "help-circle-outline" as const,
      label: "Ayuda y soporte",
      description: "Centro de ayuda",
      onPress: () => Alert.alert("Próximamente", "Centro de ayuda aún no disponible."),
    },
    {
      icon: "log-out-outline" as const,
      label: "Cerrar sesión",
      description: "Salir de tu cuenta",
      danger: true,
      onPress: handleLogout,
    },
  ];

  const renderOutfitGrid = (data: OutfitDB[]) => {
    if (data.length === 0) {
      return (
        <View style={styles.emptyGridCard}>
          <Ionicons name="images-outline" size={36} color="#AAB7C4" />
          <Text style={styles.emptyGridTitle}>Aún no hay outfits</Text>
          <Text style={styles.emptyGridText}>
            Genera o guarda tus outfits para verlos aquí.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.grid}>
        {data.map((outfit) => (
          <View key={outfit.id} style={styles.outfitCard}>
            <View style={styles.outfitImageWrapper}>
              {getOutfitThumbnail(outfit) ? (
                <Image
                  source={{ uri: getOutfitThumbnail(outfit)! }}
                  style={styles.outfitImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.outfitImage, styles.outfitPlaceholder]}>
                  <Ionicons name="image-outline" size={24} color="#94A3B8" />
                </View>
              )}
            </View>

            <Text style={styles.outfitTitle} numberOfLines={1}>
              {outfit.name || "Outfit sugerido"}
            </Text>

            <Text style={styles.outfitMeta}>
              {outfit.items?.length || 0} prendas
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={["#4A6FA5", "#8FB8A8", "#A78BFA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={46} color="#FFFFFF" />
          </View>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.email}>{displayEmail}</Text>

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <View style={styles.statTopRow}>
                  <Ionicons name={stat.icon} size={15} color="rgba(255,255,255,0.85)" />
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
          <Text style={styles.stylesCardTitle}>Mis estilos favoritos</Text>
          <View style={styles.stylesTags}>
            {favoriteStyles.map((style) => (
              <View key={style} style={styles.styleTag}>
                <Text style={styles.styleTagText}>{style}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tabsRow}>
          {[
            { id: "outfits", label: "Mis Outfits" },
            { id: "guardados", label: "Guardados" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id as "outfits" | "guardados")}
                style={styles.tabPressable}
              >
                {isActive ? (
                  <LinearGradient
                    colors={["#4A6FA5", "#8FB8A8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabActive}
                  >
                    <Text style={styles.tabActiveText}>{tab.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabInactive}>
                    <Text style={styles.tabInactiveText}>{tab.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          {activeTab === "outfits" && renderOutfitGrid(savedOutfits)}
          {activeTab === "guardados" && renderOutfitGrid(savedOutfits)}
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={[
                styles.menuItem,
                index !== menuItems.length - 1 && styles.menuItemBorder,
              ]}
            >
              <View
                style={[
                  styles.menuIconWrapper,
                  item.danger && styles.menuIconDangerWrapper,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.danger ? "#EF4444" : "#4A6FA5"}
                />
              </View>

              <View style={styles.menuTextBlock}>
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

              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
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
    paddingBottom: 90,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  headerContent: {
    alignItems: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.20)",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.30)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: "rgba(255,255,255,0.82)",
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 22,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 16,
  },
  statTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statValue: {
    marginLeft: 4,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -16,
  },
  stylesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  stylesCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  stylesTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  styleTag: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "rgba(74,111,165,0.08)",
    borderWidth: 1,
    borderColor: "rgba(74,111,165,0.18)",
  },
  styleTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A6FA5",
  },
  tabsRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  tabPressable: {
    flex: 1,
    marginRight: 8,
  },
  tabActive: {
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActiveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  tabInactive: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInactiveText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  outfitCard: {
    width: "48%",
    marginBottom: 16,
  },
  outfitImageWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    aspectRatio: 3 / 4,
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
  outfitTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2A44",
  },
  outfitMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  emptyGridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },
  emptyGridTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2A44",
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyGridText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuIconDangerWrapper: {
    backgroundColor: "#FEF2F2",
  },
  menuTextBlock: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  menuLabelDanger: {
    color: "#EF4444",
  },
  menuDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
});