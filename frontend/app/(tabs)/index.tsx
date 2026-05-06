// app/(tabs)/index.tsx
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   FlatList,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { useAuth } from "../../src/contexts/auth";

// // --------- Tipos ----------
// type NotificationItem = {
//   id: string;
//   title: string;
//   description: string;
//   time: string; // texto corto tipo "Hace 2 h"
//   read: boolean;
// };

// type EventItem = {
//   id: string;
//   title: string;
//   date: string; // "Hoy", "Mañana", etc.
//   time: string; // "3:00 PM"
//   outfitName?: string;
// };

// // --------- Datos iniciales (demo local) ----------
// const initialNotifications: NotificationItem[] = [
//   {
//     id: "n1",
//     title: "Nuevo like en tu outfit",
//     description: "A alguien le gustó tu publicación en Explorar.",
//     time: "Hace 10 min",
//     read: false,
//   },
//   {
//     id: "n2",
//     title: "Comentario nuevo",
//     description: "“Me encantó ese vestido azul 💙”.",
//     time: "Hace 1 h",
//     read: false,
//   },
//   {
//     id: "n3",
//     title: "Recordatorio",
//     description: "Tienes un evento ‘Reunión de trabajo’ hoy a las 3:00 PM.",
//     time: "Hoy",
//     read: true,
//   },
// ];

// const initialEvents: EventItem[] = [
//   {
//     id: "e1",
//     title: "Reunión de trabajo",
//     date: "Hoy",
//     time: "3:00 PM",
//     outfitName: "Look Casual Elegante",
//   },
//   {
//     id: "e2",
//     title: "Cena con amigos",
//     date: "Mañana",
//     time: "8:00 PM",
//     outfitName: "Smart Casual",
//   },
//   {
//     id: "e3",
//     title: "Fiesta de cumpleaños",
//     date: "Sábado",
//     time: "9:30 PM",
//     outfitName: "Outfit para fiesta",
//   },
// ];

// export default function HomeScreen() {
//   const { user } = useAuth();

//   // Estado de notificaciones y eventos
//   const [notifications, setNotifications] =
//     useState<NotificationItem[]>(initialNotifications);
//   const [events] = useState<EventItem[]>(initialEvents);

//   // Modales
//   const [showNotificationsModal, setShowNotificationsModal] = useState(false);
//   const [showEventsModal, setShowEventsModal] = useState(false);

//   // ¿Hay notificaciones sin leer?
//   const unreadCount = notifications.filter((n) => !n.read).length;

//   const handleOpenNotifications = () => {
//     // al abrir, marcamos todas como leídas
//     setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//     setShowNotificationsModal(true);
//   };

//   const handleOpenEvents = () => {
//     setShowEventsModal(true);
//   };

//   const nextEvent = events[0]; // el primero como "Próximo evento"

//   return (
//     <>
//       <ScrollView style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <View>
//             <Text style={styles.headerTitle}>
//               ¡Buenos días! <Text style={{ fontSize: 28 }}>👋</Text>
//             </Text>
//             <Text style={styles.headerSubtitle}>
//               ¿Qué outfit usarás hoy, {user?.name || "usuario"}?
//             </Text>
//           </View>

//           {/* Campana de notificaciones */}
//           <TouchableOpacity
//             style={styles.bellButton}
//             onPress={handleOpenNotifications}
//           >
//             <Ionicons name="notifications-outline" size={22} color="#111827" />
//             {unreadCount > 0 && (
//               <View style={styles.bellDot}>
//                 <Text style={styles.bellDotText}>
//                   {unreadCount > 9 ? "9+" : unreadCount}
//                 </Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Tarjeta clima (estática por ahora) */}
//         <View style={styles.card}>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Ionicons name="cloud-outline" size={32} color="#4f46e5" />
//             <View style={{ marginLeft: 12 }}>
//               <Text style={styles.temperature}>22°C</Text>
//               <Text style={styles.weatherText}>Soleado</Text>
//             </View>
//           </View>
//           <Text style={styles.weatherHint}>
//             Perfecto para looks ligeros y colores claros
//           </Text>
//         </View>

//         {/* Recomendación del día */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Recomendación del día</Text>

//           <View style={styles.recommendCard}>
//             <View style={styles.recommendImagesColumn}>
//               <View style={styles.recommendImagePlaceholder} />
//               <View style={styles.recommendImagePlaceholder} />
//               <View style={styles.recommendImagePlaceholder} />
//             </View>

//             <View style={{ flex: 1 }}>
//               <Text style={styles.recommendTitle}>Look Casual Elegante</Text>
//               <Text style={styles.recommendSubtitle}>
//                 Perfecto para el día a día
//               </Text>

//               <TouchableOpacity
//                 style={styles.useOutfitButton}
//                 onPress={() => {
//                   // Por ahora solo lleva a la pestaña de outfits
//                   router.push("/(tabs)/outfits");
//                 }}
//               >
//                 <Text style={styles.useOutfitButtonText}>Usar este outfit</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* Próximos eventos */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeaderRow}>
//             <Text style={styles.sectionTitle}>Próximos eventos</Text>
//             <TouchableOpacity onPress={handleOpenEvents}>
//               <Text style={styles.linkText}>Ver todos</Text>
//             </TouchableOpacity>
//           </View>

//           {nextEvent ? (
//             <TouchableOpacity
//               style={styles.eventCard}
//               onPress={handleOpenEvents}
//             >
//               <View style={styles.eventIconContainer}>
//                 <Ionicons name="briefcase-outline" size={22} color="#ef4444" />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.eventTitle}>{nextEvent.title}</Text>
//                 <Text style={styles.eventSubtitle}>
//                   {nextEvent.date}, {nextEvent.time}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           ) : (
//             <View style={styles.eventEmptyCard}>
//               <Text style={styles.eventEmptyText}>
//                 No tienes eventos próximos.
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Acciones rápidas */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Acciones rápidas</Text>

//           <View style={styles.quickGrid}>
//             {/* Agregar prenda */}
//             <TouchableOpacity
//               style={styles.quickCard}
//               onPress={() => router.push("/(tabs)/armario")}
//             >
//               <View style={styles.quickIconCircle}>
//                 <Ionicons name="add" size={22} color="#4f46e5" />
//               </View>
//               <Text style={styles.quickText}>Agregar prenda</Text>
//             </TouchableOpacity>

//             {/* Mi calendario */}
//             <TouchableOpacity
//               style={styles.quickCard}
//               onPress={handleOpenEvents}
//             >
//               <View style={[styles.quickIconCircle, { backgroundColor: "#ecfdf3" }]}>
//                 <Ionicons name="calendar-outline" size={20} color="#22c55e" />
//               </View>
//               <Text style={styles.quickText}>Mi calendario</Text>
//             </TouchableOpacity>

//             {/* Tendencias */}
//             <TouchableOpacity
//               style={styles.quickCard}
//               onPress={() => router.push("/(tabs)/explorar")}
//             >
//               <View style={[styles.quickIconCircle, { backgroundColor: "#fff7ed" }]}>
//                 <Ionicons name="trending-up-outline" size={20} color="#f97316" />
//               </View>
//               <Text style={styles.quickText}>Tendencias</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>

//       {/* ========== MODAL NOTIFICACIONES ========== */}
//       <Modal
//         visible={showNotificationsModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowNotificationsModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Notificaciones</Text>

//             {notifications.length === 0 ? (
//               <Text style={styles.modalEmptyText}>
//                 No tienes notificaciones por ahora.
//               </Text>
//             ) : (
//               <FlatList
//                 data={notifications}
//                 keyExtractor={(item) => item.id}
//                 style={{ marginTop: 10, maxHeight: 260 }}
//                 renderItem={({ item }) => (
//                   <View style={styles.notificationItem}>
//                     <View style={styles.notificationIcon}>
//                       <Ionicons
//                         name={
//                           item.title.toLowerCase().includes("like")
//                             ? "heart-outline"
//                             : item.title.toLowerCase().includes("comentario")
//                             ? "chatbubble-ellipses-outline"
//                             : "alarm-outline"
//                         }
//                         size={18}
//                         color="#4f46e5"
//                       />
//                     </View>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.notificationTitle}>
//                         {item.title}
//                       </Text>
//                       <Text style={styles.notificationDescription}>
//                         {item.description}
//                       </Text>
//                       <Text style={styles.notificationTime}>{item.time}</Text>
//                     </View>
//                   </View>
//                 )}
//               />
//             )}

//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowNotificationsModal(false)}
//             >
//               <Text style={styles.modalCloseButtonText}>Cerrar</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* ========== MODAL EVENTOS / CALENDARIO ========== */}
//       <Modal
//         visible={showEventsModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowEventsModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Mis eventos</Text>

//             {events.length === 0 ? (
//               <Text style={styles.modalEmptyText}>
//                 Aún no has agregado eventos.
//               </Text>
//             ) : (
//               <FlatList
//                 data={events}
//                 keyExtractor={(item) => item.id}
//                 style={{ marginTop: 10, maxHeight: 260 }}
//                 renderItem={({ item }) => (
//                   <View style={styles.eventItemRow}>
//                     <View style={styles.eventItemIcon}>
//                       <Ionicons
//                         name="calendar-outline"
//                         size={18}
//                         color="#22c55e"
//                       />
//                     </View>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.eventItemTitle}>{item.title}</Text>
//                       <Text style={styles.eventItemSubtitle}>
//                         {item.date} · {item.time}
//                       </Text>
//                       {item.outfitName && (
//                         <Text style={styles.eventItemOutfit}>
//                           Outfit sugerido: {item.outfitName}
//                         </Text>
//                       )}
//                     </View>
//                   </View>
//                 )}
//               />
//             )}

//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowEventsModal(false)}
//             >
//               <Text style={styles.modalCloseButtonText}>Cerrar</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// // --------- Estilos ----------
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 26,
//     fontWeight: "800",
//     color: "#111827",
//   },
//   headerSubtitle: {
//     marginTop: 4,
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   bellButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#eef2ff",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
//   },
//   bellDot: {
//     position: "absolute",
//     top: -2,
//     right: -2,
//     backgroundColor: "#ef4444",
//     minWidth: 18,
//     height: 18,
//     borderRadius: 9,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 3,
//   },
//   bellDotText: {
//     color: "white",
//     fontSize: 10,
//     fontWeight: "700",
//   },
//   card: {
//     backgroundColor: "white",
//     marginHorizontal: 20,
//     borderRadius: 20,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   temperature: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   weatherText: {
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   weatherHint: {
//     marginTop: 12,
//     fontSize: 13,
//     color: "#4f46e5",
//   },
//   section: {
//     marginTop: 24,
//     paddingHorizontal: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#111827",
//     marginBottom: 10,
//   },
//   sectionHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   linkText: {
//     fontSize: 13,
//     color: "#4f46e5",
//     fontWeight: "600",
//   },
//   // Recomendación
//   recommendCard: {
//     backgroundColor: "white",
//     borderRadius: 20,
//     padding: 14,
//     flexDirection: "row",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   recommendImagesColumn: {
//     width: 60,
//     marginRight: 12,
//     justifyContent: "space-between",
//   },
//   recommendImagePlaceholder: {
//     width: 56,
//     height: 56,
//     borderRadius: 14,
//     backgroundColor: "#e5e7eb",
//   },
//   recommendTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   recommendSubtitle: {
//     marginTop: 4,
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   useOutfitButton: {
//     marginTop: 12,
//     backgroundColor: "#4f46e5",
//     paddingVertical: 10,
//     borderRadius: 999,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   useOutfitButtonText: {
//     color: "white",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   // Próximos eventos
//   eventCard: {
//     marginTop: 4,
//     backgroundColor: "white",
//     borderRadius: 18,
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.04,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   eventIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#fee2e2",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },
//   eventTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   eventSubtitle: {
//     fontSize: 13,
//     color: "#6b7280",
//   },
//   eventEmptyCard: {
//     marginTop: 4,
//     padding: 16,
//     borderRadius: 16,
//     backgroundColor: "#e5e7eb",
//   },
//   eventEmptyText: {
//     fontSize: 13,
//     color: "#6b7280",
//   },
//   // Quick actions
//   quickGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   quickCard: {
//     width: "48%",
//     backgroundColor: "white",
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.04,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   quickIconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#eef2ff",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 10,
//   },
//   quickText: {
//     fontSize: 14,
//     color: "#111827",
//     fontWeight: "500",
//   },
//   // Modales
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: "88%",
//     borderRadius: 18,
//     backgroundColor: "white",
//     padding: 18,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   modalEmptyText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   modalCloseButton: {
//     marginTop: 16,
//     backgroundColor: "#4f46e5",
//     borderRadius: 999,
//     paddingVertical: 10,
//     alignItems: "center",
//   },
//   modalCloseButtonText: {
//     color: "white",
//     fontWeight: "600",
//   },
//   // Items notificaciones
//   notificationItem: {
//     flexDirection: "row",
//     marginBottom: 10,
//     backgroundColor: "#f9fafb",
//     borderRadius: 12,
//     padding: 10,
//   },
//   notificationIcon: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: "#eef2ff",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },
//   notificationTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   notificationDescription: {
//     fontSize: 13,
//     color: "#4b5563",
//   },
//   notificationTime: {
//     marginTop: 2,
//     fontSize: 11,
//     color: "#9ca3af",
//   },
//   // Items eventos en modal
//   eventItemRow: {
//     flexDirection: "row",
//     marginBottom: 10,
//     backgroundColor: "#f9fafb",
//     borderRadius: 12,
//     padding: 10,
//   },
//   eventItemIcon: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: "#ecfdf3",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },
//   eventItemTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   eventItemSubtitle: {
//     fontSize: 13,
//     color: "#4b5563",
//   },
//   eventItemOutfit: {
//     fontSize: 12,
//     color: "#16a34a",
//     marginTop: 2,
//   },
// });

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/src/contexts/auth";
import { get } from "@/src/api";

type ClothingItem = {
  id: number;
  userId?: number;
  imageUrl: string;
  type?: string | null;
  color?: string | null;
  brand?: string | null;
  category?: string | null;
  confidence?: number | null;
  createdAt?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const userName = user?.name ?? "Usuario";
  const userId = user?.id;

  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const trends = ["Minimal Chic", "Boho Style", "Streetwear", "Vintage", "Elegant"];

  const hasClothes = clothes.length > 0;

  const loadClothes = async () => {
    if (!userId) return;

    try {
      setErrorMessage("");
      setLoading(true);

      const data = await get<ClothingItem[]>(`/api/clothes/user/${userId}`);

      setClothes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error cargando prendas en inicio:", error);
      setErrorMessage("No pudimos cargar tu armario por ahora.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClothes();
    }, [userId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClothes();
    setRefreshing(false);
  };

  const latestClothes = clothes.slice(0, 6);

  const categoriesCount = clothes.reduce<Record<string, number>>((acc, item) => {
    const category = item.category || item.type || "Sin categoría";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.entries(categoriesCount).slice(0, 4);

  const quickActions = [
    {
      id: "wardrobe",
      title: hasClothes ? "Agrega otra prenda" : "Sube tu primera prenda",
      subtitle: hasClothes
        ? "Mantén actualizado tu armario digital"
        : "Empieza a construir tu armario digital",
      icon: "shirt-outline" as const,
      route: "/(tabs)/armario",
    },
    {
      id: "generate",
      title: hasClothes ? "Genera un outfit" : "Genera tu primer outfit",
      subtitle: hasClothes
        ? "Crea combinaciones usando tus prendas"
        : "Recibe una recomendación con tu estilo",
      icon: "sparkles-outline" as const,
      route: "/(tabs)/outfits",
    },
    {
      id: "explore",
      title: "Explora inspiración",
      subtitle: "Descubre ideas y estilos para ti",
      icon: "compass-outline" as const,
      route: "/(tabs)/explorar",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={["#4A6FA5", "#8FB8A8", "#A78BFA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.greeting}>Hola, {userName}</Text>
          <Text style={styles.headerSubtitle}>
            Tu espacio para descubrir, organizar y crear outfits con tu estilo.
          </Text>

          <View style={styles.welcomeBadge}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.welcomeBadgeText}>Bienvenida a CLOSI</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="sunny-outline" size={24} color="#FFFFFF" />
            </View>

            <Text style={styles.heroTitle}>Hoy: 24°C · Soleado</Text>
            <Text style={styles.heroSubtitle}>
              {hasClothes
                ? "Ya tienes prendas en tu armario. Puedes generar un outfit más personalizado."
                : "Un día perfecto para empezar con un look fresco y ligero."}
            </Text>

            <Pressable
              onPress={() => router.push("/(tabs)/outfits")}
              style={styles.primaryButtonWrapper}
            >
              <LinearGradient
                colors={["#4A6FA5", "#8FB8A8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {hasClothes ? "Generar outfit con mi armario" : "Generar outfit para hoy"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {loading && clothes.length === 0 ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#4A6FA5" />
              <Text style={styles.loadingText}>Cargando tu armario...</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorCard}>
              <Ionicons name="warning-outline" size={22} color="#B45309" />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <Pressable onPress={loadClothes} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {hasClothes ? "Acciones rápidas" : "Tus primeros pasos"}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {hasClothes
                ? "Sigue construyendo tu estilo con tu armario digital."
                : "Como todavía estás empezando, aquí tienes acciones útiles para personalizar tu experiencia."}
            </Text>

            {quickActions.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(item.route as any)}
                style={styles.actionCard}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={item.icon} size={22} color="#4A6FA5" />
                </View>

                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>{item.title}</Text>
                  <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {hasClothes ? "Tu armario" : "Tu armario está vacío"}
            </Text>

            {!hasClothes ? (
              <View style={styles.emptyCard}>
                <Ionicons name="images-outline" size={34} color="#8FB8A8" />
                <Text style={styles.emptyTitle}>Aún no has agregado prendas</Text>
                <Text style={styles.emptySubtitle}>
                  Sube algunas fotos de ropa para que OutfitLab pueda recomendarte combinaciones más personalizadas.
                </Text>

                <Pressable
                  onPress={() => router.push("/upload-clothing")}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Agregar prenda</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{clothes.length}</Text>
                    <Text style={styles.summaryLabel}>
                      {clothes.length === 1 ? "prenda" : "prendas"}
                    </Text>
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{Object.keys(categoriesCount).length}</Text>
                    <Text style={styles.summaryLabel}>
                      {Object.keys(categoriesCount).length === 1 ? "categoría" : "categorías"}
                    </Text>
                  </View>
                </View>

                {categories.length > 0 ? (
                  <View style={styles.categoriesContainer}>
                    {categories.map(([category, count]) => (
                      <View key={category} style={styles.categoryChip}>
                        <Text style={styles.categoryChipText}>
                          {category} · {count}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.latestHeader}>
                  <Text style={styles.latestTitle}>Últimas prendas</Text>

                  <Pressable onPress={() => router.push("/(tabs)/armario" as any)}>
                    <Text style={styles.viewAllText}>Ver todo</Text>
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.clothesList}
                >
                  {latestClothes.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.clothingCard}
                      onPress={() => router.push("/(tabs)/armario" as any)}
                    >
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.clothingImage}
                        resizeMode="cover"
                      />

                      <View style={styles.clothingInfo}>
                        <Text style={styles.clothingCategory} numberOfLines={1}>
                          {item.category || item.type || "Prenda"}
                        </Text>

                        {item.color ? (
                          <Text style={styles.clothingDetail} numberOfLines={1}>
                            {item.color}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  ))}

                  <Pressable
                    onPress={() => router.push("/upload-clothing")}
                    style={styles.addMoreCard}
                  >
                    <Ionicons name="add" size={26} color="#4A6FA5" />
                    <Text style={styles.addMoreText}>Agregar</Text>
                  </Pressable>
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trending-up-outline" size={18} color="#8FB8A8" />
              <Text style={styles.sectionTitleSmall}>Tendencias</Text>
            </View>

            <View style={styles.trendsContainer}>
              {trends.map((trend) => (
                <Pressable
                  key={trend}
                  style={styles.trendChip}
                  onPress={() => router.push("/(tabs)/explorar" as any)}
                >
                  <Text style={styles.trendChipText}>{trend}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF3F7" },
  scrollContent: { paddingBottom: 28 },

  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 38,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  greeting: {
    fontSize: 34,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  headerSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
    maxWidth: 310,
    marginBottom: 18,
  },

  welcomeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  welcomeBadgeText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "500",
  },

  content: {
    paddingHorizontal: 24,
    marginTop: -12,
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    marginBottom: 22,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2A44",
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    marginBottom: 18,
  },

  primaryButtonWrapper: {},

  primaryButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  loadingText: {
    marginLeft: 10,
    color: "#6B7280",
    fontSize: 13,
  },

  errorCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  errorText: {
    color: "#92400E",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 10,
  },

  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  retryButtonText: {
    color: "#92400E",
    fontWeight: "600",
    fontSize: 12,
  },

  section: {
    marginBottom: 26,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2A44",
    marginBottom: 8,
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    marginBottom: 16,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitleSmall: {
    marginLeft: 8,
    fontSize: 21,
    fontWeight: "600",
    color: "#1F2A44",
  },

  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "rgba(74,111,165,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  actionTextContainer: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2A44",
    marginBottom: 4,
  },

  actionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2A44",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#4A6FA5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },

  secondaryButtonText: {
    color: "#4A6FA5",
    fontSize: 14,
    fontWeight: "600",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2A44",
  },

  summaryLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#E5E7EB",
  },

  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  categoryChip: {
    backgroundColor: "rgba(143,184,168,0.15)",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  categoryChipText: {
    color: "#3F6F62",
    fontSize: 12,
    fontWeight: "600",
  },

  latestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  latestTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2A44",
  },

  viewAllText: {
    color: "#4A6FA5",
    fontSize: 13,
    fontWeight: "600",
  },

  clothesList: {
    paddingRight: 24,
  },

  clothingCard: {
    width: 118,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  clothingImage: {
    width: "100%",
    height: 118,
    backgroundColor: "#E5E7EB",
  },

  clothingInfo: {
    padding: 10,
  },

  clothingCategory: {
    fontSize: 13,
    color: "#1F2A44",
    fontWeight: "700",
  },

  clothingDetail: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },

  addMoreCard: {
    width: 98,
    height: 158,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4A6FA5",
  },

  addMoreText: {
    marginTop: 6,
    color: "#4A6FA5",
    fontSize: 12,
    fontWeight: "600",
  },

  trendsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  trendChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },

  trendChipText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "500",
  },
});