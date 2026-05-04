
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";

import { API_URL } from "../../src/api";
import { useAuth } from "../../src/contexts/auth";
import {
  getUserClothes,
  uploadClothing,
  updateClothing,
  deleteClothing,
  Prenda,
} from "../../src/services/clothingServie";
import {
  formatClothingType,
  formatCategoryLabel,
} from "../../src/utils/clothingLabels";

type ClothingItem = Prenda;

const CATEGORY_FILTERS = {
  todos: null as string[] | null,
  blusas: [
    "top",
    "tops",
    "blusa",
    "blusas",
    "camisa",
    "camisas",
    "camiseta",
    "camisetas",
    "playera",
    "playeras",
  ],
  vestidos: ["dress", "vestido", "vestidos"],
  pantalones: [
    "bottom",
    "bottoms",
    "pantalon",
    "pantalón",
    "pantalones",
    "falda",
    "faldas",
    "short",
    "shorts",
  ],
  abrigos: [
    "outerwear",
    "abrigo",
    "abrigos",
    "chaqueta",
    "chamarra",
    "chamarras",
    "sudadera",
    "sudaderas",
  ],
  zapatos: ["shoes", "shoe", "zapato", "zapatos", "calzado", "tenis", "botas"],
  accesorios: [
    "accessory",
    "accessories",
    "accesorio",
    "accesorios",
    "gorra",
    "gorras",
    "bolso",
    "bolsa",
    "bolsas",
    "hat",
    "cap",
  ],
  otros: ["other", "otro", "otros", "sin categoria", "sin categoría"],
};

function normalizeText(value?: string | null) {
  return (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getImageUrl(rawUrl?: string | null) {
  if (!rawUrl) return null;

  const cleanUrl = String(rawUrl).trim();

  if (!cleanUrl) return null;

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  const cleanPath = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;

  return `${API_URL}${cleanPath}`;
}

function getSearchTextForItem(item: ClothingItem) {
  const rawType = item.type || "";
  const rawCategory = item.category || "";
  const rawColor = item.color || "";
  const rawBrand = item.brand || "";

  const formattedType = formatClothingType(item.type);
  const formattedCategory = formatCategoryLabel(item.category || "");

  return normalizeText(
    [
      rawType,
      rawCategory,
      rawColor,
      rawBrand,
      formattedType,
      formattedCategory,
    ].join(" ")
  );
}

function matchesCategory(item: ClothingItem, categoryId: string) {
  const allowedCategories =
    CATEGORY_FILTERS[categoryId as keyof typeof CATEGORY_FILTERS];

  if (!allowedCategories) return true;

  const itemCategory = normalizeText(item.category || "other");
  const itemType = normalizeText(item.type || "");

  const allowed = allowedCategories.map((cat) => normalizeText(cat));

  return allowed.some(
    (cat) =>
      itemCategory.includes(cat) ||
      itemType.includes(cat) ||
      cat.includes(itemCategory) ||
      cat.includes(itemType)
  );
}

export default function ArmarioScreen() {
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("masonry");
  const [searchText, setSearchText] = useState("");

  const [allClothes, setAllClothes] = useState<ClothingItem[]>([]);
  const [filteredClothes, setFilteredClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const [editType, setEditType] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);

  const applyFilters = (
    categoryId: string,
    search: string,
    clothesList: ClothingItem[] = allClothes
  ) => {
    let result = clothesList.filter((item) => matchesCategory(item, categoryId));

    const normalizedSearch = normalizeText(search);

    if (normalizedSearch) {
      result = result.filter((item) => {
        const itemSearchText = getSearchTextForItem(item);
        return itemSearchText.includes(normalizedSearch);
      });
    }

    setFilteredClothes(result);
  };

  const loadUserClothes = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const clothes = await getUserClothes(String(user.id));

      const normalizedClothes = clothes.map((item) => ({
        ...item,
        imageUrl: getImageUrl(item.imageUrl) || item.imageUrl,
      }));

      console.log(
        "👕 Prendas cargadas:",
        normalizedClothes.map((item) => ({
          id: item.id,
          imageUrl: item.imageUrl,
          type: item.type,
          category: item.category,
        }))
      );

      setAllClothes(normalizedClothes);
      applyFilters(selectedCategory, searchText, normalizedClothes);
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

  useFocusEffect(
    useCallback(() => {
      loadUserClothes();
    }, [user?.id])
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    applyFilters(categoryId, searchText);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    applyFilters(selectedCategory, text);
  };

  const clearSearchAndFilters = () => {
    setSearchText("");
    setSelectedCategory("todos");
    applyFilters("todos", "");
    setFilterModalVisible(false);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

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
    Alert.alert(
      "Tips para una mejor foto",
      "Para que OutfitLab reconozca mejor tu prenda:\n\n" +
        "• Coloca la prenda extendida sobre una superficie plana o colgada en un gancho.\n" +
        "• Usa un fondo sólido, de preferencia blanco, beige o claro.\n" +
        "• Evita fondos con muchas cosas o patrones.\n" +
        "• Toma la foto con buena luz natural.\n" +
        "• Procura que se vea toda la prenda completa.\n" +
        "• Evita sombras fuertes o fotos borrosas.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Continuar",
          onPress: () => {
            Alert.alert("Agregar prenda", "Selecciona una opción", [
              {
                text: "Tomar foto",
                onPress: takePhoto,
              },
              {
                text: "Elegir de galería",
                onPress: pickFromGallery,
              },
              {
                text: "Cancelar",
                style: "cancel",
              },
            ]);
          },
        },
      ]
    );
  };

  const openEditModal = (item: ClothingItem) => {
    setSelectedItem(item);
    setEditType(item.type || "");
    setEditCategory(item.category || "");
    setEditColor(item.color || "");
    setEditBrand(item.brand || "");
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setSelectedItem(null);
    setEditType("");
    setEditCategory("");
    setEditColor("");
    setEditBrand("");
    setEditModalVisible(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem?.id) return;

    setSavingEdit(true);

    try {
      await updateClothing(String(selectedItem.id), {
        type: editType.trim(),
        category: editCategory.trim(),
        color: editColor.trim(),
        brand: editBrand.trim(),
      });

      await loadUserClothes();
      closeEditModal();

      Alert.alert("Listo", "La prenda se actualizó correctamente.");
    } catch (error: any) {
      console.error("Error editando prenda:", error);

      const status = error?.response?.status;

      if (status === 404) {
        Alert.alert(
          "Ruta no encontrada",
          "El frontend está llamando a PATCH /api/clothes/:id, pero esa ruta no existe todavía en el backend."
        );
      } else {
        Alert.alert("Error", "No se pudo actualizar la prenda.");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteItemDirectly = async (item: ClothingItem) => {
    setDeletingItem(true);

    try {
      await deleteClothing(String(item.id));

      if (selectedItem?.id === item.id) {
        closeEditModal();
      }

      await loadUserClothes();

      Alert.alert("Eliminada", "La prenda se eliminó correctamente.");
    } catch (error) {
      console.error("Error eliminando prenda:", error);
      Alert.alert("Error", "No se pudo eliminar la prenda.");
    } finally {
      setDeletingItem(false);
    }
  };

  const handleDeleteItem = (item: ClothingItem) => {
    Alert.alert(
      "Eliminar prenda",
      `¿Seguro que quieres eliminar "${formatClothingType(item.type)}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteItemDirectly(item),
        },
      ]
    );
  };

  const showItemOptions = (item: ClothingItem) => {
    Alert.alert("Opciones de prenda", "¿Qué quieres hacer?", [
      {
        text: "Editar",
        onPress: () => openEditModal(item),
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => handleDeleteItem(item),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  const categories = useMemo(() => {
    const countByFilter = (filterId: keyof typeof CATEGORY_FILTERS) => {
      return allClothes.filter((item) => matchesCategory(item, filterId)).length;
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
      {
        id: "accesorios",
        label: "Accesorios",
        count: countByFilter("accesorios"),
      },
      { id: "otros", label: "Otros", count: countByFilter("otros") },
    ];
  }, [allClothes]);

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#4A6FA5" />
          <Text style={styles.stateTitle}>Cargando tu armario...</Text>
          <Text style={styles.stateText}>Estamos preparando tus prendas.</Text>
        </View>
      );
    }

    const hasSearchOrFilter = searchText.trim() || selectedCategory !== "todos";

    return (
      <View style={styles.stateContainer}>
        <Ionicons name="shirt-outline" size={58} color="#B8C2CC" />

        <Text style={styles.stateTitle}>
          {hasSearchOrFilter
            ? "No encontramos prendas"
            : "Tu armario está vacío"}
        </Text>

        <Text style={styles.stateText}>
          {hasSearchOrFilter
            ? "Prueba escribir otro texto o limpiar los filtros."
            : "Comienza agregando tus prendas favoritas para crear outfits personalizados."}
        </Text>

        {hasSearchOrFilter ? (
          <Pressable
            onPress={clearSearchAndFilters}
            style={styles.clearEmptyButton}
          >
            <Text style={styles.clearEmptyButtonText}>Limpiar búsqueda</Text>
          </Pressable>
        ) : (
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

    const imageUri = getImageUrl(item.imageUrl);

    return (
      <View style={styles.itemWrapper}>
        <View style={styles.itemCard}>
          <View>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={[styles.itemImage, { height: imageHeight }]}
                resizeMode="cover"
                onError={(error) => {
                  console.log("❌ Error cargando imagen:", {
                    id: item.id,
                    imageUri,
                    nativeEvent: error.nativeEvent,
                  });
                }}
              />
            ) : (
              <View
                style={[
                  styles.itemImage,
                  styles.imagePlaceholder,
                  { height: imageHeight },
                ]}
              >
                <Ionicons name="image-outline" size={32} color="#9CA3AF" />
              </View>
            )}

            <Pressable
              onPress={() => showItemOptions(item)}
              style={styles.itemMenuButton}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color="#172554" />
            </Pressable>
          </View>

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

            {!!item.brand && (
              <Text style={styles.itemBrand} numberOfLines={1}>
                Marca: {item.brand}
              </Text>
            )}

            <View style={styles.itemActions}>
              <Pressable
                onPress={() => openEditModal(item)}
                style={styles.smallActionButton}
              >
                <Ionicons name="create-outline" size={15} color="#4A6FA5" />
                <Text style={styles.smallActionText}>Editar</Text>
              </Pressable>

              <Pressable
                onPress={() => handleDeleteItem(item)}
                style={[styles.smallActionButton, styles.deleteSmallButton]}
              >
                <Ionicons name="trash-outline" size={15} color="#B91C1C" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const selectedItemImageUri = getImageUrl(selectedItem?.imageUrl);

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
                  placeholder="Buscar por tipo, color, marca..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                />

                {searchText.trim() ? (
                  <Pressable
                    onPress={() => handleSearchChange("")}
                    style={styles.clearSearchButton}
                  >
                    <Ionicons name="close" size={18} color="#9CA3AF" />
                  </Pressable>
                ) : null}

                <Pressable
                  style={styles.filterButton}
                  onPress={() => setFilterModalVisible(true)}
                >
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

                <Text style={styles.viewLabel}>
                  {viewMode === "masonry" ? "Vista Pinterest" : "Vista Grid"}
                </Text>
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

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>

              <Pressable onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#172554" />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Filtrar por categoría</Text>

            <View style={styles.modalCategories}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    handleCategoryChange(category.id);
                    setFilterModalVisible(false);
                  }}
                  style={[
                    styles.modalCategoryChip,
                    selectedCategory === category.id &&
                      styles.modalCategoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalCategoryText,
                      selectedCategory === category.id &&
                        styles.modalCategoryTextActive,
                    ]}
                  >
                    {category.label}
                    {category.count > 0 ? ` (${category.count})` : ""}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={clearSearchAndFilters}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          style={styles.editModalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.editModalCard}>
            <View style={styles.editModalHeader}>
              <Text style={styles.modalTitle}>Editar prenda</Text>

              <Pressable onPress={closeEditModal} style={styles.closeButton}>
                <Ionicons name="close" size={26} color="#172554" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.editModalBody}
              contentContainerStyle={styles.editModalBodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {selectedItemImageUri ? (
                <Image
                  source={{ uri: selectedItemImageUri }}
                  style={styles.editPreviewImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log("❌ Error cargando imagen preview:", {
                      selectedItemImageUri,
                      nativeEvent: error.nativeEvent,
                    });
                  }}
                />
              ) : null}

              <Text style={styles.modalLabel}>Nombre o tipo</Text>
              <TextInput
                value={editType}
                onChangeText={setEditType}
                placeholder="Ej. Blusa, vestido, chamarra..."
                placeholderTextColor="#9CA3AF"
                style={styles.modalInput}
                returnKeyType="next"
              />

              <Text style={styles.modalLabel}>Categoría</Text>
              <TextInput
                value={editCategory}
                onChangeText={setEditCategory}
                placeholder="Ej. top, dress, bottom, outerwear..."
                placeholderTextColor="#9CA3AF"
                style={styles.modalInput}
                returnKeyType="next"
              />

              <View style={styles.categoryHelpBox}>
                <Text style={styles.categoryHelpText}>
                  Puedes usar: top, dress, bottom, outerwear, shoes, accessory,
                  other. También acepta palabras como vestido, blusa, chamarra o
                  gorra.
                </Text>
              </View>

              <Text style={styles.modalLabel}>Color</Text>
              <TextInput
                value={editColor}
                onChangeText={setEditColor}
                placeholder="Ej. azul, negro, gris..."
                placeholderTextColor="#9CA3AF"
                style={styles.modalInput}
                returnKeyType="next"
              />

              <Text style={styles.modalLabel}>Marca</Text>
              <TextInput
                value={editBrand}
                onChangeText={setEditBrand}
                placeholder="Ej. Zara, Adidas..."
                placeholderTextColor="#9CA3AF"
                style={styles.modalInput}
                returnKeyType="done"
              />

              <View style={styles.modalButtonsContainer}>
                <Pressable
                  onPress={handleSaveEdit}
                  disabled={savingEdit || deletingItem}
                  style={[
                    styles.saveButtonWrapper,
                    (savingEdit || deletingItem) && styles.disabledButton,
                  ]}
                >
                  <LinearGradient
                    colors={["#4A6FA5", "#8FB8A8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButton}
                  >
                    {savingEdit ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        Guardar cambios
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (selectedItem) {
                      handleDeleteItem(selectedItem);
                    }
                  }}
                  disabled={savingEdit || deletingItem}
                  style={[
                    styles.deleteFullButton,
                    (savingEdit || deletingItem) && styles.disabledButton,
                  ]}
                >
                  {deletingItem ? (
                    <ActivityIndicator color="#B91C1C" />
                  ) : (
                    <>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#B91C1C"
                      />
                      <Text style={styles.deleteFullButtonText}>
                        Eliminar prenda
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

  clearSearchButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
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

  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  itemMenuButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
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

  itemBrand: {
    marginTop: 6,
    fontSize: 11,
    color: "#6B7280",
  },

  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  smallActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74,111,165,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  smallActionText: {
    marginLeft: 4,
    color: "#4A6FA5",
    fontSize: 11,
    fontWeight: "700",
  },

  deleteSmallButton: {
    backgroundColor: "rgba(185,28,28,0.08)",
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

  clearEmptyButton: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#4A6FA5",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },

  clearEmptyButtonText: {
    color: "#4A6FA5",
    fontSize: 15,
    fontWeight: "700",
  },

  filterModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  filterModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    maxHeight: "88%",
  },

  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },

  editModalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "92%",
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 8,
  },

  editModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  editModalBody: {
    width: "100%",
  },

  editModalBodyContent: {
    paddingBottom: 28,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#172554",
  },

  modalLabel: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 12,
  },

  modalInput: {
    width: "100%",
    backgroundColor: "#EEF3F7",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#172554",
    marginBottom: 4,
  },

  modalCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  modalCategoryChip: {
    backgroundColor: "#EEF3F7",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },

  modalCategoryChipActive: {
    backgroundColor: "#4A6FA5",
  },

  modalCategoryText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "700",
  },

  modalCategoryTextActive: {
    color: "#FFFFFF",
  },

  clearFiltersButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#4A6FA5",
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: "center",
  },

  clearFiltersText: {
    color: "#4A6FA5",
    fontSize: 14,
    fontWeight: "700",
  },

  editPreviewImage: {
    width: "100%",
    height: 170,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },

  categoryHelpBox: {
    width: "100%",
    backgroundColor: "rgba(143,184,168,0.15)",
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },

  categoryHelpText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#3F6F62",
  },

  modalButtonsContainer: {
    width: "100%",
    marginTop: 18,
  },

  saveButtonWrapper: {
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },

  saveButton: {
    width: "100%",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  deleteFullButton: {
    width: "100%",
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#B91C1C",
    backgroundColor: "rgba(185,28,28,0.08)",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  deleteFullButtonText: {
    marginLeft: 8,
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.7,
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