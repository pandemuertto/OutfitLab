
// app/(tabs)/armario.tsx
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   FlatList,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useState, useEffect } from "react";
// import * as ImagePicker from "expo-image-picker";

// import { API_URL } from "../../src/api";
// import { useAuth } from "../../src/contexts/auth";

// type ClothingItem = {
//   id: number;
//   imageUrl: string;
//   type?: string;
//   color?: string;
//   category?: string | null;
// };

// // Mapeo de categorías UI → categorías de la BD
// const CATEGORY_FILTERS = {
//   todas: null as string[] | null,
//   camisetas: [
//     "camiseta",
//     "camisa",
//     "blusa",
//     "top",
//     "playera",
//     "sueter",
//     "sudadera",
//     "cardigan",
//   ],
//   pantalones: ["pantalon", "jeans", "shorts", "falda", "leggins"],
//   zapatos: ["calzado", "tenis", "bota", "sandalia", "tacones", "botín", "botin"],
//   accesorios: [
//     "bolso",
//     "mochila",
//     "sombrero",
//     "gorra",
//     "bufanda",
//     "cinturon",
//     "reloj",
//     "lentes",
//   ],
// };

// export default function ArmarioScreen() {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState("todas");
//   const [allClothes, setAllClothes] = useState<ClothingItem[]>([]);
//   const [filteredClothes, setFilteredClothes] = useState<ClothingItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   const categories = [
//     { id: "todas", name: "Todas", icon: "grid-outline" },
//     { id: "camisetas", name: "Camisetas", icon: "shirt-outline" },
//     { id: "pantalones", name: "Pantalones", icon: "cut-outline" },
//     { id: "zapatos", name: "Zapatos", icon: "footsteps-outline" },
//     { id: "accesorios", name: "Accesorios", icon: "watch-outline" },
//   ];

//   const loadUserClothes = async () => {
//     if (!user?.id) {
//       console.log("No hay user.id aún, no se cargan prendas");
//       return;
//     }

//     setLoading(true);
//     try {
//       const r = await fetch(`${API_URL}/api/clothes/user/${user.id}`);
//       const data = await r.json();
//       const clothes = Array.isArray(data) ? data : [];
//       setAllClothes(clothes);
//       applyFilter(activeTab, clothes);
//     } catch (e) {
//       console.error(e);
//       Alert.alert("Error", "No se pudieron cargar las prendas");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFilter = (
//     categoryId: string,
//     clothesList: ClothingItem[] = allClothes
//   ) => {
//     const allowedCategories =
//       CATEGORY_FILTERS[categoryId as keyof typeof CATEGORY_FILTERS];

//     if (!allowedCategories) {
//       setFilteredClothes(clothesList);
//     } else {
//       const filtered = clothesList.filter((item) => {
//         const cat = (item.category || "otro").toLowerCase();
//         return allowedCategories.includes(cat);
//       });
//       setFilteredClothes(filtered);
//     }
//   };

//   const handleTabChange = (categoryId: string) => {
//     setActiveTab(categoryId);
//     applyFilter(categoryId);
//   };

//   useEffect(() => {
//     loadUserClothes();
//   }, [user?.id]);

//   const takePhoto = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permiso denegado",
//         "Necesitas permitir el acceso a la cámara"
//       );
//       return;
//     }
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });
//     if (!result.canceled) await uploadImage(result.assets[0].uri);
//   };

//   const pickFromGallery = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permiso denegado",
//         "Necesitas permitir el acceso a la galería"
//       );
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });
//     if (!result.canceled) await uploadImage(result.assets[0].uri);
//   };

//   const uploadImage = async (uri: string) => {
//     if (!user?.id) {
//       Alert.alert("Error", "Debes iniciar sesión para agregar prendas");
//       return;
//     }

//     setUploading(true);
//     try {
//       const form = new FormData();
//       form.append(
//         "image",
//         {
//           uri,
//           type: "image/jpeg",
//           name: `clothing_${Date.now()}.jpg`,
//         } as any
//       );
//       form.append("userId", String(user.id));

//       const resp = await fetch(`${API_URL}/api/clothes/upload`, {
//         method: "POST",
//         body: form,
//       });
//       const created = await resp.json();

//       if (!resp.ok) throw new Error(created?.error || "Upload failed");

//       const newList = [created.prenda || created, ...allClothes];
//       setAllClothes(newList);
//       applyFilter(activeTab, newList);

//       Alert.alert(
//         "Éxito",
//         `Prenda clasificada como: ${
//           created.classification?.category || "otro"
//         }`
//       );
//     } catch (e) {
//       console.error("upload error:", e);
//       Alert.alert("Error", "No se pudo subir la imagen");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const showUploadOptions = () => {
//     Alert.alert("Agregar prenda", "Selecciona una opción", [
//       { text: "Tomar foto", onPress: takePhoto },
//       { text: "Elegir de galería", onPress: pickFromGallery },
//       { text: "Cancelar", style: "cancel" },
//     ]);
//   };

//   const renderEmptyOrLoading = () => {
//     if (loading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#667eea" />
//           <Text style={styles.loadingText}>Cargando prendas...</Text>
//         </View>
//       );
//     }
//     return (
//       <View style={styles.emptyState}>
//         <Ionicons name="shirt-outline" size={64} color="#ccc" />
//         <Text style={styles.emptyStateTitle}>
//           {activeTab === "todas"
//             ? "Tu armario está vacío"
//             : "No hay prendas en esta categoría"}
//         </Text>
//         <Text style={styles.emptyStateText}>
//           {activeTab === "todas"
//             ? "Comienza a agregar tus prendas favoritas"
//             : "Prueba con otra categoría o agrega más prendas"}
//         </Text>
//         {activeTab === "todas" && (
//           <TouchableOpacity
//             style={styles.addButton}
//             onPress={showUploadOptions}
//             disabled={uploading}
//           >
//             {uploading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.addButtonText}>Agregar prenda</Text>
//             )}
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.searchContainer}>
//           <Ionicons name="search-outline" size={20} color="#666" />
//           <Text style={styles.searchPlaceholder}>Buscar prenda...</Text>
//         </View>
//         <TouchableOpacity style={styles.filterButton}>
//           <Ionicons name="options-outline" size={24} color="#333" />
//         </TouchableOpacity>
//       </View>

//       {/* Categorías */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={styles.categoriesContainer}
//       >
//         {categories.map((c) => (
//           <TouchableOpacity
//             key={c.id}
//             style={[
//               styles.categoryButton,
//               activeTab === c.id && styles.categoryButtonActive,
//             ]}
//             onPress={() => handleTabChange(c.id)}
//           >
//             <Ionicons
//               name={c.icon as any}
//               size={20}
//               color={activeTab === c.id ? "#fff" : "#666"}
//             />
//             <Text
//               style={[
//                 styles.categoryText,
//                 activeTab === c.id && styles.categoryTextActive,
//               ]}
//             >
//               {c.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Grid */}
//       <FlatList
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.gridContent}
//         data={filteredClothes}
//         numColumns={2}
//         keyExtractor={(item, idx) => item.id?.toString() ?? String(idx)}
//         columnWrapperStyle={
//           filteredClothes.length > 0 ? styles.gridRow : undefined
//         }
//         renderItem={({ item }) => (
//           <View style={styles.clothingItem}>
//             <Image
//               source={{ uri: item.imageUrl }}
//               style={styles.clothingImage}
//               resizeMode="cover"
//             />
//             {item.category && (
//               <View style={styles.categoryBadge}>
//                 <Text style={styles.categoryBadgeText}>{item.category}</Text>
//               </View>
//             )}
//           </View>
//         )}
//         ListEmptyComponent={renderEmptyOrLoading()}
//       />

//       {/* FAB */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={showUploadOptions}
//         disabled={uploading}
//       >
//         {uploading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Ionicons name="add" size={24} color="#fff" />
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8f9fa" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 20,
//     backgroundColor: "#fff",
//   },
//   searchContainer: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginRight: 10,
//   },
//   searchPlaceholder: { marginLeft: 10, color: "#666", fontSize: 16 },
//   filterButton: {
//     width: 44,
//     height: 44,
//     backgroundColor: "#f5f5f5",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 10,
//   },
//   categoriesContainer: {
//     backgroundColor: "#fff",
//     paddingVertical: 15,
//     paddingLeft: 15,
//   },
//   categoryButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: "#f5f5f5",
//     marginRight: 10,
//   },
//   categoryButtonActive: { backgroundColor: "#667eea" },
//   categoryText: { marginLeft: 6, fontSize: 14, color: "#666" },
//   categoryTextActive: { color: "#fff" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 60,
//   },
//   loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
//   emptyState: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 60,
//     paddingHorizontal: 20,
//   },
//   emptyStateTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#333",
//     marginTop: 20,
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: "#666",
//     marginBottom: 30,
//     textAlign: "center",
//   },
//   addButton: {
//     backgroundColor: "#667eea",
//     paddingHorizontal: 30,
//     paddingVertical: 15,
//     borderRadius: 25,
//     minWidth: 150,
//     alignItems: "center",
//   },
//   addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   gridContent: { padding: 20, paddingBottom: 100 },
//   gridRow: { justifyContent: "space-between", marginBottom: 15 },
//   clothingItem: {
//     width: "48%",
//     aspectRatio: 1,
//     marginBottom: 15,
//     borderRadius: 12,
//     overflow: "hidden",
//     backgroundColor: "#fff",
//     position: "relative",
//   },
//   clothingImage: { width: "100%", height: "100%" },
//   categoryBadge: {
//     position: "absolute",
//     bottom: 8,
//     left: 8,
//     backgroundColor: "rgba(102, 126, 234, 0.9)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   categoryBadgeText: {
//     color: "#fff",
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   fab: {
//     position: "absolute",
//     right: 20,
//     bottom: 20,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: "#667eea",
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//   },
// });
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "../../src/contexts/auth";
import {
  getUserClothes,
  uploadClothing,
  Prenda,
} from "../../src/services/clothingServie";
import {
  formatClothingType,
  formatCategoryLabel,
} from "../../src/utils/clothingLabels";

type ClothingItem = Prenda;

const CATEGORY_FILTERS = {
  todos: null as string[] | null,
  blusas: ["top"],
  vestidos: ["dress"],
  pantalones: ["bottom"],
  abrigos: ["outerwear"],
  zapatos: ["shoes"],
  accesorios: ["accessory"],
  otros: ["other"],
};

export default function ArmarioScreen() {
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("masonry");
  const [searchText, setSearchText] = useState("");

  const [allClothes, setAllClothes] = useState<ClothingItem[]>([]);
  const [filteredClothes, setFilteredClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadUserClothes = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const clothes = await getUserClothes(String(user.id));
      setAllClothes(clothes);
      applyFilters(selectedCategory, searchText, clothes);
    } catch (error) {
      console.error("Error cargando prendas:", error);
      Alert.alert("Error", "No se pudieron cargar las prendas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserClothes();
  }, [user?.id]);

  const applyFilters = (
    categoryId: string,
    search: string,
    clothesList: ClothingItem[] = allClothes
  ) => {
    const allowedCategories =
      CATEGORY_FILTERS[categoryId as keyof typeof CATEGORY_FILTERS];

    let result = clothesList;

    if (allowedCategories) {
      result = result.filter((item) => {
        const cat = (item.category || "other").toLowerCase();
        return allowedCategories.includes(cat);
      });
    }

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((item) => {
        const type = (item.type || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const color = (item.color || "").toLowerCase();
        const brand = (item.brand || "").toLowerCase();

        return (
          type.includes(normalizedSearch) ||
          category.includes(normalizedSearch) ||
          color.includes(normalizedSearch) ||
          brand.includes(normalizedSearch)
        );
      });
    }

    setFilteredClothes(result);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    applyFilters(categoryId, searchText);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    applyFilters(selectedCategory, text);
  };

  const pickFromGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitas permitir acceso a tus fotos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitas permitir acceso a la cámara");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?.id) {
      Alert.alert("Error", "Debes iniciar sesión para agregar prendas");
      return;
    }

    setUploading(true);

    try {
      const created = await uploadClothing(String(user.id), uri);

      await loadUserClothes();

      const firstItem = created.items?.[0];

      Alert.alert(
        "Éxito",
        created.message ||
          `Prenda clasificada como: ${
            firstItem?.type || firstItem?.category || "otro"
          }`
      );
    } catch (error) {
      console.error("upload error:", error);
      Alert.alert("Error", "No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const showUploadOptions = () => {
    Alert.alert("Agregar prenda", "Selecciona una opción", [
      { text: "Tomar foto", onPress: takePhoto },
      { text: "Elegir de galería", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const categories = useMemo(() => {
    const countByFilter = (filterId: keyof typeof CATEGORY_FILTERS) => {
      const allowed = CATEGORY_FILTERS[filterId];
      if (!allowed) return allClothes.length;

      return allClothes.filter((item) => {
        const cat = (item.category || "other").toLowerCase();
        return allowed.includes(cat);
      }).length;
    };

    return [
      { id: "todos", label: "Todos", count: countByFilter("todos") },
      { id: "blusas", label: "Blusas", count: countByFilter("blusas") },
      { id: "vestidos", label: "Vestidos", count: countByFilter("vestidos") },
      {
        id: "pantalones",
        label: "Pantalones",
        count: countByFilter("pantalones"),
      },
      { id: "abrigos", label: "Abrigos", count: countByFilter("abrigos") },
      { id: "zapatos", label: "Zapatos", count: countByFilter("zapatos") },
    ];
  }, [allClothes]);

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#4A6FA5" />
          <Text style={styles.stateTitle}>Cargando tu armario...</Text>
          <Text style={styles.stateText}>
            Estamos preparando tus prendas.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.stateContainer}>
        <Ionicons name="shirt-outline" size={58} color="#B8C2CC" />
        <Text style={styles.stateTitle}>
          {selectedCategory === "todos"
            ? "Tu armario está vacío"
            : "No hay prendas en esta categoría"}
        </Text>
        <Text style={styles.stateText}>
          {selectedCategory === "todos"
            ? "Comienza agregando tus prendas favoritas para crear outfits personalizados."
            : "Prueba otra categoría o agrega más prendas a tu colección."}
        </Text>

        {selectedCategory === "todos" && (
          <Pressable
            onPress={showUploadOptions}
            disabled={uploading}
            style={styles.emptyButtonWrapper}
          >
            <LinearGradient
              colors={["#4A6FA5", "#8FB8A8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyButton}
            >
              {uploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.emptyButtonText}>Agregar prenda</Text>
              )}
            </LinearGradient>
          </Pressable>
        )}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: ClothingItem; index: number }) => {
    const imageHeight =
      viewMode === "masonry" ? (index % 2 === 0 ? 190 : 155) : 170;

    return (
      <View style={styles.itemWrapper}>
        <View style={styles.itemCard}>
          <Image
            source={{ uri: item.imageUrl }}
            style={[styles.itemImage, { height: imageHeight }]}
            resizeMode="cover"
          />

          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {formatClothingType(item.type)}
            </Text>

            <View style={styles.itemMetaRow}>
              {!!item.category && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {formatCategoryLabel(item.category)}
                  </Text>
                </View>
              )}

              {!!item.color && (
                <Text style={styles.itemColor} numberOfLines={1}>
                  {item.color}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredClothes}
        key={viewMode}
        numColumns={2}
        keyExtractor={(item, idx) => item.id?.toString() ?? String(idx)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={
          filteredClothes.length > 0 ? styles.columnWrapper : undefined
        }
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={["#4A6FA5", "#8FB8A8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <Text style={styles.headerTitle}>Mi Armario</Text>
              <Text style={styles.headerSubtitle}>
                {allClothes.length} prendas en tu colección
              </Text>
            </LinearGradient>

            <View style={styles.content}>
              <View style={styles.searchCard}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color="#9CA3AF"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={searchText}
                  onChangeText={handleSearchChange}
                  placeholder="Buscar en tu armario..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                />
                <Pressable style={styles.filterButton}>
                  <Ionicons name="options-outline" size={20} color="#4A6FA5" />
                </Pressable>
              </View>

              <View style={styles.viewRow}>
                <View style={styles.viewButtons}>
                  <Pressable
                    onPress={() => setViewMode("grid")}
                    style={[
                      styles.viewButton,
                      viewMode === "grid" && styles.viewButtonActive,
                    ]}
                  >
                    <Ionicons
                      name="grid-outline"
                      size={18}
                      color={viewMode === "grid" ? "#FFFFFF" : "#9CA3AF"}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() => setViewMode("masonry")}
                    style={[
                      styles.viewButton,
                      viewMode === "masonry" && styles.viewButtonActive,
                    ]}
                  >
                    <Ionicons
                      name="apps-outline"
                      size={18}
                      color={viewMode === "masonry" ? "#FFFFFF" : "#9CA3AF"}
                    />
                  </Pressable>
                </View>

                <Text style={styles.viewLabel}>Vista Pinterest</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => handleCategoryChange(category.id)}
                    style={styles.categoryPressable}
                  >
                    {selectedCategory === category.id ? (
                      <LinearGradient
                        colors={["#4A6FA5", "#8FB8A8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.categoryActive}
                      >
                        <Text style={styles.categoryActiveText}>
                          {category.label}
                          {category.count > 0 ? ` (${category.count})` : ""}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.categoryInactive}>
                        <Text style={styles.categoryInactiveText}>
                          {category.label}
                          {category.count > 0 ? ` (${category.count})` : ""}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </>
        }
        ListEmptyComponent={renderEmptyState()}
      />

      <Pressable
        onPress={showUploadOptions}
        disabled={uploading}
        style={styles.fabWrapper}
      >
        <LinearGradient
          colors={["#4A6FA5", "#8FB8A8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="add" size={28} color="#FFFFFF" />
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF3F7" },

  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 38,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
  },

  content: {
    marginTop: -16,
    paddingHorizontal: 24,
    marginBottom: 12,
  },

  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },

  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  viewButtons: {
    flexDirection: "row",
  },

  viewButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  viewButtonActive: {
    backgroundColor: "#4A6FA5",
  },

  viewLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  categoriesContainer: {
    paddingBottom: 6,
    paddingRight: 12,
  },

  categoryPressable: {
    marginRight: 10,
  },

  categoryActive: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },

  categoryActiveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  categoryInactive: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  categoryInactiveText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 112,
    flexGrow: 1,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },

  itemWrapper: {
    width: "48%",
  },

  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },

  itemImage: {
    width: "100%",
    backgroundColor: "#E5E7EB",
  },

  itemInfo: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172554",
    marginBottom: 6,
  },

  itemMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    backgroundColor: "#EEF3F7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 11,
    color: "#4A6FA5",
    fontWeight: "700",
  },

  itemColor: {
    fontSize: 12,
    color: "#6B7280",
    maxWidth: 70,
  },

  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 40,
  },

  stateTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: "700",
    color: "#172554",
    textAlign: "center",
  },

  stateText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    textAlign: "center",
  },

  emptyButtonWrapper: {
    marginTop: 24,
  },

  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  fabWrapper: {
    position: "absolute",
    right: 20,
    bottom: 92,
  },

  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 8,
  },
});