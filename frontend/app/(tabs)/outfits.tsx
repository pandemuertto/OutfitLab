//frontend/app/(tabs)/outfits.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Pressable,
//   Image,
//   Alert,
//   Modal,
//   TextInput,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";

// import { post, get, API_URL } from "../../src/api";
// import { useAuth } from "../../src/contexts/auth";

// interface Prenda {
//   id: number;
//   imageUrl: string;
//   type?: string | null;
//   color?: string | null;
//   category?: string | null;
//   brand?: string | null;
//   confidence?: number | null;
// }

// interface GeneratedOutfit {
//   type: "dress" | "separates";
//   score: number;
//   reason: string;
//   items?: Prenda[];
//   pieces?: Prenda[];
// }

// interface OutfitItemDB {
//   prenda: Prenda;
// }

// interface OutfitDB {
//   id: string;
//   name?: string | null;
//   occasion?: string | null;
//   dressCode?: string | null;
//   weather?: string | null;
//   photoUrl?: string | null;
//   items: OutfitItemDB[];
// }

// type SelectedOutfit =
//   | { kind: "generated"; data: GeneratedOutfit }
//   | { kind: "saved"; data: OutfitDB };

// export default function OutfitsScreen() {
//   const { user } = useAuth();

//   const [occasion, setOccasion] = useState("");
//   const [weather, setWeather] = useState("");
//   const [style, setStyle] = useState("");

//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedOutfit, setGeneratedOutfit] = useState<GeneratedOutfit | null>(
//     null
//   );

//   const [savedOutfits, setSavedOutfits] = useState<OutfitDB[]>([]);
//   const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

//   const [selected, setSelected] = useState<SelectedOutfit | null>(null);
//   const [showOutfitModal, setShowOutfitModal] = useState(false);

//   const [publishModalVisible, setPublishModalVisible] = useState(false);
//   const [publishTargetOutfitId, setPublishTargetOutfitId] = useState<
//     string | null
//   >(null);
//   const [publishTitle, setPublishTitle] = useState("");

//   const occasions = [
//     { id: "casual", label: "Casual", emoji: "👕" },
//     { id: "trabajo", label: "Trabajo", emoji: "💼" },
//     { id: "fiesta", label: "Fiesta", emoji: "🎉" },
//     { id: "deportivo", label: "Deportivo", emoji: "⚡" },
//     { id: "romantico", label: "Romántico", emoji: "💕" },
//   ];

//   const weatherOptions = [
//     { value: "sunny", label: "Soleado", emoji: "🌤️" },
//     { value: "cloudy", label: "Nublado", emoji: "☁️" },
//     { value: "cold", label: "Frío", emoji: "❄️" },
//     { value: "rainy", label: "Lluvioso", emoji: "🌧️" },
//   ];

//   const styleOptions = [
//     { id: "moderno", label: "Moderno" },
//     { id: "clasico", label: "Clásico" },
//     { id: "boho", label: "Boho" },
//     { id: "minimal", label: "Minimalista" },
//     { id: "elegante", label: "Elegante" },
//   ];

//   const canGenerate = !!occasion && !!weather && !!style;

//   const generatedPieces =
//     generatedOutfit?.items || generatedOutfit?.pieces || [];

//   const getItemImageUrl = (item: { imageUrl?: string | null }) => {
//     if (!item?.imageUrl) return null;
//     if (item.imageUrl.startsWith("http")) return item.imageUrl;
//     return `${API_URL}${item.imageUrl}`;
//   };

//   const getOutfitThumbnail = (o: OutfitDB): string | null => {
//     if (o.photoUrl) {
//       if (o.photoUrl.startsWith("http")) return o.photoUrl;
//       return `${API_URL}${o.photoUrl}`;
//     }

//     const first = o.items?.[0]?.prenda;
//     if (!first) return null;

//     return getItemImageUrl(first);
//   };

//   const getOccasionLabel = (value?: string | null) => {
//     return occasions.find((item) => item.id === value)?.label || value || "";
//   };

//   const getWeatherLabel = (value?: string | null) => {
//     return (
//       weatherOptions.find((item) => item.value === value)?.label || value || ""
//     );
//   };

//   const getStyleLabel = (value?: string | null) => {
//     return styleOptions.find((item) => item.id === value)?.label || value || "";
//   };

//   const loadSavedOutfits = async () => {
//     try {
//       if (!user?.id) return;

//       const response = await get(`/api/outfits/user/${user.id}`);
//       setSavedOutfits(Array.isArray(response) ? response : []);
//     } catch (err) {
//       console.error("Error cargando outfits guardados:", err);
//     }
//   };

//   useEffect(() => {
//     loadSavedOutfits();
//   }, [user?.id]);

//   const favoriteOutfits = useMemo(
//     () => savedOutfits.filter((o) => favoriteIds.has(o.id)),
//     [savedOutfits, favoriteIds]
//   );

//   const isFavorite = (id: string) => favoriteIds.has(id);

//   const toggleFavorite = (id: string) => {
//     setFavoriteIds((prev) => {
//       const next = new Set(prev);

//       if (next.has(id)) {
//         next.delete(id);
//       } else {
//         next.add(id);
//       }

//       return next;
//     });
//   };

//   const handleGenerate = async () => {
//     if (!user?.id) {
//       Alert.alert("Error", "Debes iniciar sesión para generar outfits");
//       return;
//     }

//     try {
//       setIsGenerating(true);

//       const response = await post("/api/outfits/generate", {
//         userId: user.id,
//         occasion,
//         dressCode: style,
//         weather,
//       });

//       console.log("RESPUESTA OUTFITS:", JSON.stringify(response, null, 2));

//       if (response?.outfits?.[0]) {
//         setGeneratedOutfit(response.outfits[0]);
//       } else {
//         Alert.alert(
//           "Sin resultados",
//           "No se pudo generar un outfit con las prendas disponibles."
//         );
//       }
//     } catch (error: any) {
//       console.error("❌ Error generando outfit:", error);

//       const backendMessage =
//         error?.response?.data?.error ||
//         error?.response?.data?.message ||
//         error?.message ||
//         "No se pudo generar el outfit. Intenta de nuevo.";

//       Alert.alert("Error", backendMessage);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const saveGeneratedOutfit = async () => {
//     if (!generatedOutfit || !user?.id) return;

//     try {
//       const itemIds = (generatedOutfit.items || generatedOutfit.pieces || [])
//         .map((p) => Number(p.id))
//         .filter((id) => Number.isInteger(id) && id > 0);

//       if (!itemIds.length) {
//         Alert.alert("Error", "No hay prendas válidas para guardar el outfit.");
//         return;
//       }

//       await post("/api/outfits", {
//         userId: user.id,
//         name: "Outfit sugerido",
//         occasion,
//         dressCode: style,
//         weather,
//         itemIds,
//       });

//       Alert.alert("Guardado", "Tu outfit se guardó en Mis colecciones.");
//       await loadSavedOutfits();
//     } catch (error: any) {
//       console.error("Error guardando outfit:", error);
//       console.log("RESP ERROR GUARDAR:", error?.response?.data);

//       Alert.alert(
//         "Error",
//         error?.response?.data?.error ||
//           error?.response?.data?.message ||
//           "No se pudo guardar el outfit."
//       );
//     }
//   };

//   const generateAnother = () => {
//     setGeneratedOutfit(null);
//   };

//   const takePhotoAndUpdateOutfit = async (
//     outfitId: string,
//     publishToExplore: boolean,
//     postTitle?: string
//   ) => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();

//       if (status !== "granted") {
//         Alert.alert(
//           "Permiso requerido",
//           "Necesitamos acceso a la cámara para tomar la foto."
//         );
//         return;
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [3, 4],
//         quality: 0.8,
//       });

//       if (result.canceled) return;

//       const photo = result.assets[0];

//       const formData = new FormData();

//       formData.append(
//         "image",
//         {
//           uri: photo.uri,
//           name: "outfit.jpg",
//           type: photo.mimeType || "image/jpeg",
//         } as any
//       );

//       formData.append("publishToExplore", publishToExplore ? "true" : "false");

//       if (postTitle) {
//         formData.append("postTitle", postTitle);
//       }

//       const res = await fetch(`${API_URL}/api/outfits/${outfitId}/photo`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         console.log("Respuesta backend foto:", await res.text());
//         throw new Error("Error subiendo foto");
//       }

//       const data = await res.json();
//       const newUrl = data.photo?.url as string;

//       setSavedOutfits((prev) =>
//         prev.map((o) =>
//           o.id === outfitId
//             ? {
//                 ...o,
//                 photoUrl: newUrl,
//               }
//             : o
//         )
//       );

//       setSelected((prev) => {
//         if (!prev || prev.kind !== "saved") return prev;
//         if (prev.data.id !== outfitId) return prev;

//         return {
//           kind: "saved",
//           data: {
//             ...prev.data,
//             photoUrl: newUrl,
//           },
//         };
//       });

//       Alert.alert(
//         publishToExplore ? "Publicado" : "Foto guardada",
//         publishToExplore
//           ? "Tu foto se publicó en Explorar."
//           : "La foto se guardó para tu outfit."
//       );

//       if (publishToExplore) {
//         router.navigate("/(tabs)/explorar");
//       }
//     } catch (err) {
//       console.error("Error al tomar foto:", err);
//       Alert.alert("Error", "Error subiendo foto");
//     }
//   };

//   const deleteSelectedOutfit = () => {
//     if (!selected || selected.kind !== "saved") return;

//     const outfitId = selected.data.id;

//     Alert.alert(
//       "Eliminar outfit",
//       "¿Seguro que quieres eliminar este outfit? Esta acción no se puede deshacer.",
//       [
//         { text: "Cancelar", style: "cancel" },
//         {
//           text: "Eliminar",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const res = await fetch(`${API_URL}/api/outfits/${outfitId}`, {
//                 method: "DELETE",
//               });

//               if (!res.ok) {
//                 console.log("Respuesta backend delete:", await res.text());
//                 throw new Error("Error eliminando outfit");
//               }

//               setSavedOutfits((prev) => prev.filter((o) => o.id !== outfitId));

//               setFavoriteIds((prev) => {
//                 const next = new Set(prev);
//                 next.delete(outfitId);
//                 return next;
//               });

//               setShowOutfitModal(false);
//               setSelected(null);

//               Alert.alert("Eliminado", "Tu outfit se eliminó correctamente.");
//             } catch (err) {
//               console.error("Error eliminando outfit:", err);
//               Alert.alert(
//                 "Error",
//                 "No se pudo eliminar el outfit. Intenta de nuevo."
//               );
//             }
//           },
//         },
//       ]
//     );
//   };

//   const openSavedOutfit = (outfit: OutfitDB) => {
//     setSelected({ kind: "saved", data: outfit });
//     setShowOutfitModal(true);
//   };

//   const openGeneratedOutfit = () => {
//     if (!generatedOutfit) return;

//     setSelected({ kind: "generated", data: generatedOutfit });
//     setShowOutfitModal(true);
//   };

//   const openPublishModal = () => {
//     if (!selected || selected.kind !== "saved") return;

//     setPublishTargetOutfitId(selected.data.id);
//     setPublishTitle(selected.data.name || "Outfit sugerido");
//     setPublishModalVisible(true);
//   };

//   const confirmPublish = () => {
//     if (!publishTargetOutfitId) return;

//     const titleToSend =
//       publishTitle.trim().length > 0
//         ? publishTitle.trim()
//         : "Outfit sugerido";

//     setPublishModalVisible(false);
//     takePhotoAndUpdateOutfit(publishTargetOutfitId, true, titleToSend);
//   };

//   const getSelectedItems = (): Prenda[] => {
//     if (!selected) return [];

//     if (selected.kind === "generated") {
//       return selected.data.items || selected.data.pieces || [];
//     }

//     return selected.data.items.map((item) => item.prenda);
//   };

//   const selectedItems = getSelectedItems();

//   const selectedTitle =
//     selected?.kind === "generated"
//       ? "Outfit sugerido"
//       : selected?.data.name || "Outfit";

//   const selectedSubtitle = (() => {
//     if (!selected) return "";

//     if (selected.kind === "generated") {
//       return `${getOccasionLabel(occasion) || "Sin ocasión"} · ${
//         getStyleLabel(style) || "Sin estilo"
//       } · ${getWeatherLabel(weather) || "Sin clima"}`;
//     }

//     return `${getOccasionLabel(selected.data.occasion) || "Sin ocasión"} · ${
//       getStyleLabel(selected.data.dressCode) ||
//       selected.data.dressCode ||
//       "Sin estilo"
//     } · ${getWeatherLabel(selected.data.weather) || "Sin clima"}`;
//   })();

//   return (
//     <>
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <LinearGradient
//           colors={["#4A6FA5", "#8FB8A8", "#A78BFA"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.header}
//         >
//           <View style={styles.headerRow}>
//             <View style={styles.headerIcon}>
//               <Ionicons name="sparkles" size={20} color="#FFFFFF" />
//             </View>

//             <Text style={styles.headerTitle}>Generar Outfit</Text>
//           </View>

//           <Text style={styles.headerSubtitle}>Crea el look perfecto con IA</Text>
//         </LinearGradient>

//         <View style={styles.content}>
//           {!generatedOutfit ? (
//             <>
//               <View style={styles.card}>
//                 <Text style={styles.cardTitle}>¿Para qué ocasión?</Text>

//                 <View style={styles.occasionGrid}>
//                   {occasions.map((occ) => {
//                     const isSelected = occasion === occ.id;

//                     return (
//                       <Pressable
//                         key={occ.id}
//                         onPress={() => setOccasion(occ.id)}
//                         style={[
//                           styles.occasionCard,
//                           isSelected && styles.occasionCardSelected,
//                         ]}
//                       >
//                         <Text style={styles.occasionEmoji}>{occ.emoji}</Text>
//                         <Text style={styles.occasionLabel}>{occ.label}</Text>
//                       </Pressable>
//                     );
//                   })}
//                 </View>
//               </View>

//               <View style={styles.card}>
//                 <Text style={styles.cardTitle}>¿Cómo está el clima?</Text>

//                 <View style={styles.weatherGrid}>
//                   {weatherOptions.map((w) => {
//                     const isSelected = weather === w.value;

//                     return (
//                       <Pressable
//                         key={w.value}
//                         onPress={() => setWeather(w.value)}
//                         style={[
//                           styles.weatherCard,
//                           isSelected && styles.weatherCardSelected,
//                         ]}
//                       >
//                         <Text style={styles.weatherEmoji}>{w.emoji}</Text>
//                         <Text style={styles.weatherLabel}>{w.label}</Text>
//                       </Pressable>
//                     );
//                   })}
//                 </View>
//               </View>

//               <View style={styles.card}>
//                 <Text style={styles.cardTitle}>¿Qué estilo prefieres?</Text>

//                 <View style={styles.styleChips}>
//                   {styleOptions.map((s) => {
//                     const isSelected = style === s.id;

//                     return (
//                       <Pressable
//                         key={s.id}
//                         onPress={() => setStyle(s.id)}
//                         style={[
//                           styles.styleChip,
//                           isSelected && styles.styleChipSelected,
//                         ]}
//                       >
//                         <Text
//                           style={[
//                             styles.styleChipText,
//                             isSelected && styles.styleChipTextSelected,
//                           ]}
//                         >
//                           {s.label}
//                         </Text>
//                       </Pressable>
//                     );
//                   })}
//                 </View>
//               </View>

//               <Pressable
//                 onPress={handleGenerate}
//                 disabled={!canGenerate || isGenerating}
//                 style={styles.generateButtonWrapper}
//               >
//                 {canGenerate && !isGenerating ? (
//                   <LinearGradient
//                     colors={["#4A6FA5", "#8FB8A8"]}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 0 }}
//                     style={styles.generateButton}
//                   >
//                     <Ionicons
//                       name="sparkles-outline"
//                       size={20}
//                       color="#FFFFFF"
//                       style={{ marginRight: 8 }}
//                     />

//                     <Text style={styles.generateButtonText}>
//                       Generar Outfit Perfecto
//                     </Text>
//                   </LinearGradient>
//                 ) : (
//                   <View style={styles.generateButtonDisabled}>
//                     {isGenerating ? (
//                       <>
//                         <ActivityIndicator
//                           color="#FFFFFF"
//                           style={{ marginRight: 8 }}
//                         />

//                         <Text style={styles.generateButtonText}>
//                           Creando tu outfit...
//                         </Text>
//                       </>
//                     ) : (
//                       <Text style={styles.generateButtonText}>
//                         Generar Outfit Perfecto
//                       </Text>
//                     )}
//                   </View>
//                 )}
//               </Pressable>
//             </>
//           ) : (
//             <View style={styles.resultCard}>
//               <View style={styles.resultHeader}>
//                 <View>
//                   <Text style={styles.resultEyebrow}>Moodboard generado</Text>
//                   <Text style={styles.resultTitle}>Tu Outfit Perfecto ✨</Text>
//                 </View>

//                 <Pressable onPress={handleGenerate} style={styles.resultLinkPill}>
//                   <Ionicons name="refresh-outline" size={15} color="#4A6FA5" />
//                   <Text style={styles.resultLink}>Otro</Text>
//                 </Pressable>
//               </View>

//               <Pressable onPress={openGeneratedOutfit}>
//                 <View style={styles.moodboardGrid}>
//                   {generatedPieces.map((item, index) => (
//                     <View
//                       key={`${item.id}-${index}`}
//                       style={[
//                         styles.moodboardItem,
//                         index === 0 && styles.moodboardItemTall,
//                       ]}
//                     >
//                       <Image
//                         source={{ uri: getItemImageUrl(item) || "" }}
//                         style={styles.moodboardImage}
//                         resizeMode="cover"
//                       />

//                       <LinearGradient
//                         colors={["transparent", "rgba(0,0,0,0.68)"]}
//                         start={{ x: 0, y: 0 }}
//                         end={{ x: 0, y: 1 }}
//                         style={styles.moodboardOverlay}
//                       />

//                       <View style={styles.moodboardTextBlock}>
//                         <Text
//                           style={styles.moodboardItemTitle}
//                           numberOfLines={1}
//                         >
//                           {item.type || "Prenda"}
//                         </Text>

//                         <Text
//                           style={styles.moodboardItemSubtitle}
//                           numberOfLines={1}
//                         >
//                           {item.category || "Categoría"}
//                         </Text>
//                       </View>
//                     </View>
//                   ))}
//                 </View>
//               </Pressable>

//               <View style={styles.resultActions}>
//                 <Pressable
//                   onPress={saveGeneratedOutfit}
//                   style={styles.saveButtonWrapper}
//                 >
//                   <LinearGradient
//                     colors={["#4A6FA5", "#8FB8A8"]}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 0 }}
//                     style={styles.saveButton}
//                   >
//                     <Ionicons
//                       name="heart-outline"
//                       size={19}
//                       color="#FFFFFF"
//                       style={{ marginRight: 8 }}
//                     />

//                     <Text style={styles.saveButtonText}>Guardar Outfit</Text>
//                   </LinearGradient>
//                 </Pressable>

//                 <Pressable onPress={generateAnother} style={styles.roundButton}>
//                   <Ionicons
//                     name="shuffle-outline"
//                     size={21}
//                     color="#4A6FA5"
//                   />
//                 </Pressable>
//               </View>
//             </View>
//           )}

//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Mis colecciones</Text>

//             {savedOutfits.length === 0 ? (
//               <View style={styles.emptyCollectionCard}>
//                 <Ionicons name="albums-outline" size={34} color="#AAB7C4" />

//                 <Text style={styles.emptyCollectionTitle}>
//                   Aún no tienes outfits guardados
//                 </Text>

//                 <Text style={styles.emptyCollectionText}>
//                   Genera tu primer outfit y guárdalo para verlo aquí.
//                 </Text>
//               </View>
//             ) : (
//               <View style={styles.collectionsGrid}>
//                 {savedOutfits.map((o) => (
//                   <Pressable
//                     key={o.id}
//                     style={styles.collectionCard}
//                     onPress={() => openSavedOutfit(o)}
//                   >
//                     <View style={styles.collectionImageContainer}>
//                       <Image
//                         source={{ uri: getOutfitThumbnail(o) || "" }}
//                         style={styles.collectionImage}
//                         resizeMode="cover"
//                       />

//                       <LinearGradient
//                         colors={["transparent", "rgba(0,0,0,0.45)"]}
//                         style={styles.collectionOverlay}
//                       />

//                       <Pressable
//                         style={styles.favoriteButton}
//                         onPress={() => toggleFavorite(o.id)}
//                       >
//                         <Ionicons
//                           name={isFavorite(o.id) ? "heart" : "heart-outline"}
//                           size={18}
//                           color={isFavorite(o.id) ? "#ff4b8b" : "#374151"}
//                         />
//                       </Pressable>
//                     </View>

//                     <Text style={styles.collectionName} numberOfLines={1}>
//                       {o.name || "Outfit sugerido"}
//                     </Text>

//                     <Text style={styles.collectionCount}>
//                       {o.items.length} prendas
//                     </Text>
//                   </Pressable>
//                 ))}
//               </View>
//             )}
//           </View>

//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Favoritos</Text>

//             {favoriteOutfits.length === 0 ? (
//               <Text style={styles.emptyFavoritesText}>
//                 Aún no tienes favoritos. Toca el corazón de un outfit para verlo
//                 aquí.
//               </Text>
//             ) : (
//               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                 {favoriteOutfits.map((o) => (
//                   <Pressable
//                     key={o.id}
//                     style={styles.favoriteCard}
//                     onPress={() => openSavedOutfit(o)}
//                   >
//                     <View style={styles.favoriteImageContainer}>
//                       <Image
//                         source={{ uri: getOutfitThumbnail(o) || "" }}
//                         style={styles.favoriteImage}
//                         resizeMode="cover"
//                       />

//                       <Pressable
//                         style={styles.favoriteButton}
//                         onPress={() => toggleFavorite(o.id)}
//                       >
//                         <Ionicons
//                           name={isFavorite(o.id) ? "heart" : "heart-outline"}
//                           size={16}
//                           color={isFavorite(o.id) ? "#ff4b8b" : "#374151"}
//                         />
//                       </Pressable>
//                     </View>

//                     <Text style={styles.favoriteName} numberOfLines={1}>
//                       {o.name || "Outfit sugerido"}
//                     </Text>
//                   </Pressable>
//                 ))}
//               </ScrollView>
//             )}
//           </View>
//         </View>
//       </ScrollView>

//       <Modal
//         visible={showOutfitModal && !!selected}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setShowOutfitModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.outfitSheet}>
//             <View style={styles.modalTopHandle} />

//             {selected && (
//               <>
//                 <View style={styles.outfitModalHeader}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.modalEyebrow}>Detalle del look</Text>
//                     <Text style={styles.modalTitle}>{selectedTitle}</Text>
//                     <Text style={styles.modalSubtitle}>{selectedSubtitle}</Text>
//                   </View>

//                   <Pressable
//                     onPress={() => setShowOutfitModal(false)}
//                     style={styles.closeButton}
//                   >
//                     <Ionicons name="close" size={24} color="#1F2A44" />
//                   </Pressable>
//                 </View>

//                 <ScrollView
//                   style={styles.outfitModalScroll}
//                   contentContainerStyle={styles.outfitModalScrollContent}
//                   showsVerticalScrollIndicator={false}
//                 >
//                   <View style={styles.editorialGrid}>
//                     {selectedItems.map((item, index) => (
//                       <View
//                         key={`${item.id}-${index}`}
//                         style={[
//                           styles.editorialItem,
//                           index === 0 && styles.editorialItemFeatured,
//                         ]}
//                       >
//                         <Image
//                           source={{ uri: getItemImageUrl(item) || "" }}
//                           style={styles.editorialImage}
//                           resizeMode="cover"
//                         />

//                         <LinearGradient
//                           colors={["transparent", "rgba(0,0,0,0.72)"]}
//                           style={styles.editorialOverlay}
//                         />

//                         <View style={styles.editorialText}>
//                           <Text style={styles.editorialName} numberOfLines={1}>
//                             {item.type || "Prenda"}
//                           </Text>

//                           <Text style={styles.editorialMeta} numberOfLines={1}>
//                             {item.category || "Sin categoría"}
//                             {item.color ? ` · ${item.color}` : ""}
//                           </Text>
//                         </View>
//                       </View>
//                     ))}
//                   </View>

//                   {selected.kind === "saved" && (
//                     <View style={styles.modalActionsBlock}>
//                       <Pressable
//                         onPress={() =>
//                           takePhotoAndUpdateOutfit(selected.data.id, false)
//                         }
//                         style={styles.modalGradientButtonWrapper}
//                       >
//                         <LinearGradient
//                           colors={["#4A6FA5", "#8FB8A8"]}
//                           start={{ x: 0, y: 0 }}
//                           end={{ x: 1, y: 0 }}
//                           style={styles.modalGradientButton}
//                         >
//                           <Ionicons
//                             name="camera-outline"
//                             size={20}
//                             color="#FFFFFF"
//                             style={{ marginRight: 8 }}
//                           />

//                           <Text style={styles.modalGradientButtonText}>
//                             Tomar foto del outfit
//                           </Text>
//                         </LinearGradient>
//                       </Pressable>

//                       <Pressable
//                         onPress={openPublishModal}
//                         style={styles.modalGradientButtonWrapper}
//                       >
//                         <LinearGradient
//                           colors={["#A78BFA", "#4A6FA5"]}
//                           start={{ x: 0, y: 0 }}
//                           end={{ x: 1, y: 0 }}
//                           style={styles.modalGradientButton}
//                         >
//                           <Ionicons
//                             name="cloud-upload-outline"
//                             size={20}
//                             color="#FFFFFF"
//                             style={{ marginRight: 8 }}
//                           />

//                           <Text style={styles.modalGradientButtonText}>
//                             Tomar foto y publicar
//                           </Text>
//                         </LinearGradient>
//                       </Pressable>

//                       <Pressable
//                         style={styles.deleteOutfitButton}
//                         onPress={deleteSelectedOutfit}
//                       >
//                         <Ionicons
//                           name="trash-outline"
//                           size={20}
//                           color="#B91C1C"
//                           style={{ marginRight: 8 }}
//                         />

//                         <Text style={styles.deleteOutfitButtonText}>
//                           Eliminar outfit
//                         </Text>
//                       </Pressable>
//                     </View>
//                   )}

//                   <Pressable
//                     style={styles.closeFullButton}
//                     onPress={() => setShowOutfitModal(false)}
//                   >
//                     <Text style={styles.closeFullButtonText}>Cerrar</Text>
//                   </Pressable>
//                 </ScrollView>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={publishModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setPublishModalVisible(false)}
//       >
//         <KeyboardAvoidingView
//           style={styles.publishOverlay}
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//         >
//           <View style={styles.publishModalContent}>
//             <Text style={styles.publishTitle}>Publicar en Explorar</Text>

//             <Text style={styles.publishSubtitle}>
//               Ponle un nombre bonito a tu publicación.
//             </Text>

//             <TextInput
//               style={styles.publishInput}
//               placeholder="Ej. Outfit casual elegante"
//               placeholderTextColor="#9ca3af"
//               value={publishTitle}
//               onChangeText={setPublishTitle}
//             />

//             <View style={styles.publishButtonsRow}>
//               <Pressable
//                 style={styles.publishCancelButton}
//                 onPress={() => setPublishModalVisible(false)}
//               >
//                 <Text style={styles.publishCancelText}>Cancelar</Text>
//               </Pressable>

//               <Pressable style={styles.publishConfirmWrapper} onPress={confirmPublish}>
//                 <LinearGradient
//                   colors={["#4A6FA5", "#8FB8A8"]}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                   style={styles.publishConfirmButton}
//                 >
//                   <Text style={styles.publishConfirmText}>Publicar</Text>
//                 </LinearGradient>
//               </Pressable>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EEF3F7",
//   },

//   scrollContent: {
//     paddingBottom: 120,
//   },

//   header: {
//     paddingTop: 64,
//     paddingHorizontal: 24,
//     paddingBottom: 36,
//   },

//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },

//   headerIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 999,
//     backgroundColor: "rgba(255,255,255,0.20)",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },

//   headerTitle: {
//     fontSize: 32,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },

//   headerSubtitle: {
//     color: "rgba(255,255,255,0.9)",
//     fontSize: 14,
//   },

//   content: {
//     paddingHorizontal: 24,
//     marginTop: -16,
//   },

//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 28,
//     padding: 24,
//     marginBottom: 18,
//     shadowColor: "#1F2A44",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     elevation: 5,
//   },

//   cardTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#1F2A44",
//     marginBottom: 16,
//   },

//   occasionGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },

//   occasionCard: {
//     width: "31%",
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: "#E5E7EB",
//     paddingVertical: 16,
//     paddingHorizontal: 8,
//     alignItems: "center",
//     marginBottom: 12,
//     backgroundColor: "#FFFFFF",
//   },

//   occasionCardSelected: {
//     borderColor: "#4A6FA5",
//     backgroundColor: "rgba(74,111,165,0.10)",
//   },

//   occasionEmoji: {
//     fontSize: 28,
//     marginBottom: 8,
//   },

//   occasionLabel: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#374151",
//     textAlign: "center",
//   },

//   weatherGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },

//   weatherCard: {
//     width: "48%",
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: "#E5E7EB",
//     paddingVertical: 20,
//     alignItems: "center",
//     marginBottom: 12,
//     backgroundColor: "#FFFFFF",
//   },

//   weatherCardSelected: {
//     borderColor: "#8FB8A8",
//     backgroundColor: "rgba(143,184,168,0.10)",
//   },

//   weatherEmoji: {
//     fontSize: 34,
//     marginBottom: 8,
//   },

//   weatherLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#374151",
//   },

//   styleChips: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },

//   styleChip: {
//     borderRadius: 999,
//     borderWidth: 2,
//     borderColor: "#E5E7EB",
//     paddingHorizontal: 18,
//     paddingVertical: 11,
//     marginRight: 8,
//     marginBottom: 10,
//     backgroundColor: "#FFFFFF",
//   },

//   styleChipSelected: {
//     borderColor: "#A78BFA",
//     backgroundColor: "rgba(167,139,250,0.10)",
//   },

//   styleChipText: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#4B5563",
//   },

//   styleChipTextSelected: {
//     color: "#A78BFA",
//   },

//   generateButtonWrapper: {
//     marginBottom: 24,
//   },

//   generateButton: {
//     borderRadius: 999,
//     paddingVertical: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//   },

//   generateButtonDisabled: {
//     borderRadius: 999,
//     paddingVertical: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     backgroundColor: "#C7CDD6",
//   },

//   generateButtonText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "600",
//   },

//   resultCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 30,
//     padding: 20,
//     marginBottom: 22,
//     shadowColor: "#1F2A44",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 18,
//     elevation: 6,
//   },

//   resultHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 18,
//     alignItems: "center",
//   },

//   resultEyebrow: {
//     fontSize: 12,
//     color: "#8FB8A8",
//     fontWeight: "700",
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//     marginBottom: 4,
//   },

//   resultTitle: {
//     fontSize: 25,
//     fontWeight: "700",
//     color: "#1F2A44",
//   },

//   resultLinkPill: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#EEF3F7",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 999,
//   },

//   resultLink: {
//     color: "#4A6FA5",
//     fontSize: 13,
//     fontWeight: "700",
//     marginLeft: 4,
//   },

//   moodboardGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 18,
//   },

//   moodboardItem: {
//     width: "48%",
//     height: 190,
//     borderRadius: 24,
//     overflow: "hidden",
//     marginBottom: 12,
//     backgroundColor: "#E5E7EB",
//   },

//   moodboardItemTall: {
//     height: 225,
//   },

//   moodboardImage: {
//     width: "100%",
//     height: "100%",
//   },

//   moodboardOverlay: {
//     ...StyleSheet.absoluteFillObject,
//   },

//   moodboardTextBlock: {
//     position: "absolute",
//     left: 14,
//     right: 14,
//     bottom: 14,
//   },

//   moodboardItemTitle: {
//     color: "#FFFFFF",
//     fontSize: 17,
//     fontWeight: "800",
//   },

//   moodboardItemSubtitle: {
//     color: "rgba(255,255,255,0.86)",
//     fontSize: 13,
//     marginTop: 2,
//   },

//   resultActions: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   saveButtonWrapper: {
//     flex: 1,
//     marginRight: 12,
//   },

//   saveButton: {
//     borderRadius: 999,
//     paddingVertical: 15,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//   },

//   saveButtonText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "700",
//   },

//   roundButton: {
//     width: 54,
//     height: 54,
//     borderRadius: 999,
//     backgroundColor: "#EEF3F7",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   section: {
//     marginBottom: 24,
//   },

//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#1F2A44",
//     marginBottom: 14,
//   },

//   emptyCollectionCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 24,
//     padding: 22,
//     alignItems: "center",
//   },

//   emptyCollectionTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#1F2A44",
//     marginTop: 10,
//     marginBottom: 8,
//     textAlign: "center",
//   },

//   emptyCollectionText: {
//     fontSize: 13,
//     lineHeight: 20,
//     color: "#6B7280",
//     textAlign: "center",
//   },

//   collectionsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },

//   collectionCard: {
//     width: "48%",
//     marginBottom: 18,
//   },

//   collectionImageContainer: {
//     aspectRatio: 0.82,
//     borderRadius: 24,
//     overflow: "hidden",
//     backgroundColor: "#FFFFFF",
//     marginBottom: 8,
//     position: "relative",
//   },

//   collectionImage: {
//     width: "100%",
//     height: "100%",
//     backgroundColor: "#F3F4F6",
//   },

//   collectionOverlay: {
//     ...StyleSheet.absoluteFillObject,
//   },

//   collectionName: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#1F2A44",
//   },

//   collectionCount: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginTop: 2,
//   },

//   favoriteButton: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     width: 38,
//     height: 38,
//     borderRadius: 999,
//     backgroundColor: "rgba(255,255,255,0.95)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   emptyFavoritesText: {
//     fontSize: 13,
//     color: "#6B7280",
//     lineHeight: 20,
//   },

//   favoriteCard: {
//     width: 160,
//     marginRight: 14,
//   },

//   favoriteImageContainer: {
//     width: 160,
//     height: 210,
//     borderRadius: 24,
//     overflow: "hidden",
//     backgroundColor: "#FFFFFF",
//     marginBottom: 8,
//     position: "relative",
//   },

//   favoriteImage: {
//     width: "100%",
//     height: "100%",
//     backgroundColor: "#F3F4F6",
//   },

//   favoriteName: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#1F2A44",
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(15,23,42,0.50)",
//     justifyContent: "flex-end",
//   },

//   outfitSheet: {
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 34,
//     borderTopRightRadius: 34,
//     maxHeight: "92%",
//     paddingHorizontal: 22,
//     paddingTop: 12,
//     paddingBottom: 12,
//   },

//   modalTopHandle: {
//     alignSelf: "center",
//     width: 46,
//     height: 5,
//     borderRadius: 999,
//     backgroundColor: "#D1D5DB",
//     marginBottom: 16,
//   },

//   outfitModalHeader: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 14,
//   },

//   closeButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 999,
//     backgroundColor: "#EEF3F7",
//     alignItems: "center",
//     justifyContent: "center",
//     marginLeft: 12,
//   },

//   modalEyebrow: {
//     fontSize: 12,
//     color: "#8FB8A8",
//     fontWeight: "800",
//     textTransform: "uppercase",
//     letterSpacing: 0.9,
//     marginBottom: 4,
//   },

//   modalTitle: {
//     fontSize: 26,
//     fontWeight: "800",
//     color: "#1F2A44",
//   },

//   modalSubtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginTop: 4,
//   },

//   outfitModalScroll: {
//     width: "100%",
//   },

//   outfitModalScrollContent: {
//     paddingBottom: 28,
//   },

//   editorialGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },

//   editorialItem: {
//     width: "48%",
//     height: 205,
//     borderRadius: 26,
//     overflow: "hidden",
//     backgroundColor: "#EEF3F7",
//     marginBottom: 12,
//   },

//   editorialItemFeatured: {
//     width: "100%",
//     height: 290,
//   },

//   editorialImage: {
//     width: "100%",
//     height: "100%",
//   },

//   editorialOverlay: {
//     ...StyleSheet.absoluteFillObject,
//   },

//   editorialText: {
//     position: "absolute",
//     left: 16,
//     right: 16,
//     bottom: 16,
//   },

//   editorialName: {
//     color: "#FFFFFF",
//     fontSize: 19,
//     fontWeight: "800",
//   },

//   editorialMeta: {
//     color: "rgba(255,255,255,0.88)",
//     fontSize: 13,
//     marginTop: 3,
//   },

//   modalActionsBlock: {
//     marginTop: 6,
//   },

//   modalGradientButtonWrapper: {
//     width: "100%",
//     borderRadius: 999,
//     overflow: "hidden",
//     marginTop: 12,
//   },

//   modalGradientButton: {
//     paddingVertical: 15,
//     borderRadius: 999,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//   },

//   modalGradientButtonText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "800",
//   },

//   deleteOutfitButton: {
//     marginTop: 12,
//     width: "100%",
//     borderRadius: 999,
//     borderWidth: 1.4,
//     borderColor: "#B91C1C",
//     backgroundColor: "rgba(185,28,28,0.08)",
//     paddingVertical: 15,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//   },

//   deleteOutfitButtonText: {
//     color: "#B91C1C",
//     fontSize: 15,
//     fontWeight: "800",
//   },

//   closeFullButton: {
//     marginTop: 12,
//     width: "100%",
//     borderRadius: 999,
//     backgroundColor: "#EEF3F7",
//     paddingVertical: 15,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   closeFullButtonText: {
//     color: "#4A6FA5",
//     fontSize: 15,
//     fontWeight: "800",
//   },

//   publishOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(15,23,42,0.50)",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 22,
//   },

//   publishModalContent: {
//     width: "100%",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 28,
//     padding: 22,
//   },

//   publishTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#1F2A44",
//     marginBottom: 6,
//   },

//   publishSubtitle: {
//     fontSize: 13,
//     color: "#6B7280",
//     marginBottom: 14,
//   },

//   publishInput: {
//     borderRadius: 18,
//     backgroundColor: "#EEF3F7",
//     paddingHorizontal: 14,
//     paddingVertical: 13,
//     fontSize: 15,
//     color: "#1F2A44",
//     marginBottom: 16,
//   },

//   publishButtonsRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   publishCancelButton: {
//     flex: 1,
//     borderRadius: 999,
//     backgroundColor: "#EEF3F7",
//     paddingVertical: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },

//   publishCancelText: {
//     color: "#4B5563",
//     fontSize: 14,
//     fontWeight: "700",
//   },

//   publishConfirmWrapper: {
//     flex: 1,
//     borderRadius: 999,
//     overflow: "hidden",
//   },

//   publishConfirmButton: {
//     paddingVertical: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 999,
//   },

//   publishConfirmText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "800",
//   },
// });

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { post, get, API_URL } from "../../src/api";
import { useAuth } from "../../src/contexts/auth";

interface Prenda {
  id: number;
  imageUrl: string;
  type?: string | null;
  color?: string | null;
  category?: string | null;
  brand?: string | null;
  confidence?: number | null;
}

interface GeneratedOutfitApi {
  type: "dress" | "separates";
  score: number;
  reason: string;
  items?: Prenda[];
  pieces?: Prenda[];
}

interface GeneratedOutfit extends GeneratedOutfitApi {
  localId: string;
  title: string;
  vibe: string;
  stylingNote: string;
}

interface OutfitItemDB {
  prenda: Prenda;
}

interface OutfitDB {
  id: string;
  name?: string | null;
  occasion?: string | null;
  dressCode?: string | null;
  weather?: string | null;
  photoUrl?: string | null;
  items: OutfitItemDB[];
}

type SelectedOutfit =
  | { kind: "generated"; data: GeneratedOutfit }
  | { kind: "saved"; data: OutfitDB };

type InspirationCard = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
};

export default function OutfitsScreen() {
  const { user } = useAuth();

  const [occasion, setOccasion] = useState("");
  const [weather, setWeather] = useState("");
  const [style, setStyle] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<GeneratedOutfit[]>([]);
  const [activeGeneratedId, setActiveGeneratedId] = useState<string | null>(null);

  const [savedOutfits, setSavedOutfits] = useState<OutfitDB[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const [selected, setSelected] = useState<SelectedOutfit | null>(null);
  const [showOutfitModal, setShowOutfitModal] = useState(false);

  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [publishTargetOutfitId, setPublishTargetOutfitId] = useState<string | null>(null);
  const [publishTitle, setPublishTitle] = useState("");

  const occasions = [
    { id: "casual", label: "Casual", emoji: "👕" },
    { id: "trabajo", label: "Trabajo", emoji: "💼" },
    { id: "fiesta", label: "Fiesta", emoji: "🎉" },
    { id: "deportivo", label: "Deportivo", emoji: "⚡" },
    { id: "romantico", label: "Romántico", emoji: "💕" },
  ];

  const weatherOptions = [
    { value: "sunny", label: "Soleado", emoji: "🌤️" },
    { value: "cloudy", label: "Nublado", emoji: "☁️" },
    { value: "cold", label: "Frío", emoji: "❄️" },
    { value: "rainy", label: "Lluvioso", emoji: "🌧️" },
  ];

  const styleOptions = [
    { id: "moderno", label: "Moderno" },
    { id: "clasico", label: "Clásico" },
    { id: "boho", label: "Boho" },
    { id: "minimal", label: "Minimalista" },
    { id: "elegante", label: "Elegante" },
  ];

  const canGenerate = !!occasion && !!weather && !!style;

  const generatedOutfit = useMemo(() => {
    if (!generatedOptions.length) return null;
    return (
      generatedOptions.find((item) => item.localId === activeGeneratedId) ||
      generatedOptions[0]
    );
  }, [generatedOptions, activeGeneratedId]);

  const getOccasionLabel = (value?: string | null) =>
    occasions.find((item) => item.id === value)?.label || value || "";

  const getWeatherLabel = (value?: string | null) =>
    weatherOptions.find((item) => item.value === value)?.label || value || "";

  const getStyleLabel = (value?: string | null) =>
    styleOptions.find((item) => item.id === value)?.label || value || "";

  const getItemImageUrl = (item?: { imageUrl?: string | null }) => {
    if (!item?.imageUrl) return null;
    if (item.imageUrl.startsWith("http")) return item.imageUrl;
    return `${API_URL}${item.imageUrl}`;
  };

  const getOutfitThumbnail = (o: OutfitDB): string | null => {
    if (o.photoUrl) {
      if (o.photoUrl.startsWith("http")) return o.photoUrl;
      return `${API_URL}${o.photoUrl}`;
    }
    const first = o.items?.[0]?.prenda;
    if (!first) return null;
    return getItemImageUrl(first);
  };

  const getGeneratedItems = (outfit?: GeneratedOutfit | null): Prenda[] => {
    if (!outfit) return [];
    return outfit.items || outfit.pieces || [];
  };

  const buildGeneratedTitle = (idx: number, option: GeneratedOutfitApi) => {
    if (option.type === "dress") return `Look vestido ${idx + 1}`;
    if (style === "minimal") return `Look limpio ${idx + 1}`;
    if (style === "boho") return `Look boho ${idx + 1}`;
    if (style === "elegante") return `Look chic ${idx + 1}`;
    if (style === "clasico") return `Look clásico ${idx + 1}`;
    return `Look sugerido ${idx + 1}`;
  };

  const buildGeneratedVibe = () => {
    const styleLabel = getStyleLabel(style) || "Editorial";
    const weatherLabel = getWeatherLabel(weather) || "versátil";
    return `${styleLabel} · ${weatherLabel}`;
  };

  const buildStylingNote = (option: GeneratedOutfitApi) => {
    const mood = getOccasionLabel(occasion)?.toLowerCase() || "tu ocasión";

    if (option.type === "dress") {
      return `Ideal para ${mood}, con un acabado visual elegante y fácil de elevar con accesorios.`;
    }

    if (style === "minimal") {
      return `Líneas limpias y balanceadas para un look moderno, sencillo y pulido.`;
    }

    if (style === "boho") {
      return `Una mezcla suave y relajada, con vibra creativa y visualmente armoniosa.`;
    }

    if (style === "elegante") {
      return `Se ve más refinado y estilizado, perfecto para una vibra más cuidada.`;
    }

    return `Una combinación equilibrada para ${mood}, con estética visual actual.`;
  };

  const normalizeGeneratedOutfits = (items: GeneratedOutfitApi[] = []): GeneratedOutfit[] => {
    return items.map((item, index) => ({
      ...item,
      localId: `generated-${Date.now()}-${index}`,
      title: buildGeneratedTitle(index, item),
      vibe: buildGeneratedVibe(),
      stylingNote: buildStylingNote(item),
    }));
  };

  const inspirationCards: InspirationCard[] = useMemo(() => {
    const cards: InspirationCard[] = [];

    if (style === "minimal") {
      cards.push(
        {
          id: "ref-minimal-1",
          title: "Quiet luxury",
          subtitle: "Siluetas limpias y tonos suaves.",
          icon: "diamond-outline",
          colors: ["#accbf0", "#E2E8F0"],
        },
        {
          id: "ref-minimal-2",
          title: "Editorial clean",
          subtitle: "Prendas simples con foco visual.",
          icon: "sparkles-outline",
          colors: ["#A5B4FC", "#E9D5FF"],
        }
      );
    } else if (style === "boho") {
      cards.push(
        {
          id: "ref-boho-1",
          title: "Boho soft",
          subtitle: "Texturas fluidas y vibra relajada.",
          icon: "flower-outline",
          colors: ["#F9A8D4", "#FDE68A"],
        },
        {
          id: "ref-boho-2",
          title: "Artsy layers",
          subtitle: "Más textura y mezcla visual.",
          icon: "color-palette-outline",
          colors: ["#FCD34D", "#C4B5FD"],
        }
      );
    } else if (style === "elegante") {
      cards.push(
        {
          id: "ref-elegante-1",
          title: "Polished chic",
          subtitle: "Más estructura y sofisticación.",
          icon: "rose-outline",
          colors: ["#FCA5A5", "#DDD6FE"],
        },
        {
          id: "ref-elegante-2",
          title: "Evening edit",
          subtitle: "Una sensación más premium.",
          icon: "moon-outline",
          colors: ["#93C5FD", "#C4B5FD"],
        }
      );
    } else {
      cards.push(
        {
          id: "ref-default-1",
          title: "Pinterest ready",
          subtitle: "Balance visual y foco en la prenda.",
          icon: "images-outline",
          colors: ["#60A5FA", "#A7F3D0"],
        },
        {
          id: "ref-default-2",
          title: "Magazine feel",
          subtitle: "Una vibra más curada y visual.",
          icon: "book-outline",
          colors: ["#A78BFA", "#BFDBFE"],
        }
      );
    }

    return cards;
  }, [style]);

  const selectedItems = useMemo(() => {
    if (!selected) return [];
    if (selected.kind === "generated") return getGeneratedItems(selected.data);
    return selected.data.items.map((item) => item.prenda);
  }, [selected]);

  const selectedTitle =
    selected?.kind === "generated"
      ? selected.data.title || "Outfit sugerido"
      : selected?.data.name || "Outfit";

  const selectedSubtitle = (() => {
    if (!selected) return "";

    if (selected.kind === "generated") {
      return `${getOccasionLabel(occasion) || "Sin ocasión"} · ${
        getStyleLabel(style) || "Sin estilo"
      } · ${getWeatherLabel(weather) || "Sin clima"}`;
    }

    return `${getOccasionLabel(selected.data.occasion) || "Sin ocasión"} · ${
      getStyleLabel(selected.data.dressCode) ||
      selected.data.dressCode ||
      "Sin estilo"
    } · ${getWeatherLabel(selected.data.weather) || "Sin clima"}`;
  })();

  const loadSavedOutfits = async () => {
    try {
      if (!user?.id) return;
      const response = await get(`/api/outfits/user/${user.id}`);
      setSavedOutfits(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error cargando outfits guardados:", err);
    }
  };

  useEffect(() => {
    loadSavedOutfits();
  }, [user?.id]);

  const favoriteOutfits = useMemo(
    () => savedOutfits.filter((o) => favoriteIds.has(o.id)),
    [savedOutfits, favoriteIds]
  );

  const isFavorite = (id: string) => favoriteIds.has(id);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Debes iniciar sesión para generar outfits");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await post("/api/outfits/generate", {
        userId: user.id,
        occasion,
        dressCode: style,
        weather,
      });

      const normalized = normalizeGeneratedOutfits(response?.outfits || []);

      if (normalized.length) {
        setGeneratedOptions(normalized);
        setActiveGeneratedId(normalized[0].localId);
      } else {
        Alert.alert(
          "Sin resultados",
          "No se pudo generar un outfit con las prendas disponibles."
        );
      }
    } catch (error: any) {
      console.error("❌ Error generando outfit:", error);

      const backendMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo generar el outfit. Intenta de nuevo.";

      Alert.alert("Error", backendMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGeneratedOutfit = async () => {
    if (!generatedOutfit || !user?.id) return;

    try {
      const itemIds = getGeneratedItems(generatedOutfit)
        .map((p) => Number(p.id))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (!itemIds.length) {
        Alert.alert("Error", "No hay prendas válidas para guardar el outfit.");
        return;
      }

      await post("/api/outfits", {
        userId: user.id,
        name: generatedOutfit.title || "Outfit sugerido",
        occasion,
        dressCode: style,
        weather,
        itemIds,
      });

      Alert.alert("Guardado", "Tu outfit se guardó en Mis colecciones.");
      await loadSavedOutfits();
    } catch (error: any) {
      console.error("Error guardando outfit:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "No se pudo guardar el outfit."
      );
    }
  };

  const generateAnother = () => {
    setGeneratedOptions([]);
    setActiveGeneratedId(null);
  };

  const openSavedOutfit = (outfit: OutfitDB) => {
    setSelected({ kind: "saved", data: outfit });
    setShowOutfitModal(true);
  };

  const openGeneratedOutfit = (outfit: GeneratedOutfit) => {
    setSelected({ kind: "generated", data: outfit });
    setShowOutfitModal(true);
  };

  const takePhotoAndUpdateOutfit = async (
    outfitId: string,
    publishToExplore: boolean,
    postTitle?: string
  ) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso a la cámara para tomar la foto."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (result.canceled) return;

      const photo = result.assets[0];

      const formData = new FormData();
      formData.append(
        "image",
        {
          uri: photo.uri,
          name: "outfit.jpg",
          type: photo.mimeType || "image/jpeg",
        } as any
      );
      formData.append("publishToExplore", publishToExplore ? "true" : "false");
      if (postTitle) formData.append("postTitle", postTitle);

      const res = await fetch(`${API_URL}/api/outfits/${outfitId}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.log("Respuesta backend foto:", await res.text());
        throw new Error("Error subiendo foto");
      }

      const data = await res.json();
      const newUrl = data.photo?.url as string;

      setSavedOutfits((prev) =>
        prev.map((o) => (o.id === outfitId ? { ...o, photoUrl: newUrl } : o))
      );

      setSelected((prev) => {
        if (!prev || prev.kind !== "saved" || prev.data.id !== outfitId) return prev;
        return {
          kind: "saved",
          data: {
            ...prev.data,
            photoUrl: newUrl,
          },
        };
      });

      Alert.alert(
        publishToExplore ? "Publicado" : "Foto guardada",
        publishToExplore
          ? "Tu foto se publicó en Explorar."
          : "La foto se guardó para tu outfit."
      );

      if (publishToExplore) {
        router.navigate("/(tabs)/explorar");
      }
    } catch (err) {
      console.error("Error al tomar foto:", err);
      Alert.alert("Error", "Error subiendo foto");
    }
  };

  const deleteSelectedOutfit = () => {
    if (!selected || selected.kind !== "saved") return;

    const outfitId = selected.data.id;

    Alert.alert(
      "Eliminar outfit",
      "¿Seguro que quieres eliminar este outfit? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/outfits/${outfitId}`, {
                method: "DELETE",
              });

              if (!res.ok) {
                console.log("Respuesta backend delete:", await res.text());
                throw new Error("Error eliminando outfit");
              }

              setSavedOutfits((prev) => prev.filter((o) => o.id !== outfitId));

              setFavoriteIds((prev) => {
                const next = new Set(prev);
                next.delete(outfitId);
                return next;
              });

              setShowOutfitModal(false);
              setSelected(null);

              Alert.alert("Eliminado", "Tu outfit se eliminó correctamente.");
            } catch (err) {
              console.error("Error eliminando outfit:", err);
              Alert.alert(
                "Error",
                "No se pudo eliminar el outfit. Intenta de nuevo."
              );
            }
          },
        },
      ]
    );
  };

  const openPublishModal = () => {
    if (!selected || selected.kind !== "saved") return;

    setPublishTargetOutfitId(selected.data.id);
    setPublishTitle(selected.data.name || "Outfit sugerido");
    setPublishModalVisible(true);
  };

  const confirmPublish = () => {
    if (!publishTargetOutfitId) return;

    const titleToSend =
      publishTitle.trim().length > 0
        ? publishTitle.trim()
        : "Outfit sugerido";

    setPublishModalVisible(false);
    takePhotoAndUpdateOutfit(publishTargetOutfitId, true, titleToSend);
  };

  const renderPieceCard = (item: Prenda, index: number, compact = false) => {
    const uri = getItemImageUrl(item) || "";
    const cardHeight = compact ? 128 : index % 3 === 0 ? 188 : 150;

    return (
      <Pressable
        key={`${item.id}-${index}`}
        style={[styles.moodPieceCard, { height: cardHeight }]}
      >
        <Image source={{ uri }} style={styles.moodPieceImage} resizeMode="cover" />
        <LinearGradient
          colors={["transparent", "rgba(15,23,42,0.56)"]}
          style={styles.moodPieceOverlay}
        />
        <View style={styles.moodPieceMeta}>
          <Text style={styles.moodPieceTitle} numberOfLines={1}>
            {item.type || "Prenda"}
          </Text>
          <Text style={styles.moodPieceSubtitle} numberOfLines={1}>
            {item.color || item.category || "Detalle"}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <>
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
          <View style={styles.headerTopBadge}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>

          <Text style={styles.headerTitle}>Generar Outfit</Text>
          <Text style={styles.headerSubtitle}>
            Crea combinaciones tipo revista con una vibra más curada, visual y Pinterest.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.headerPills}
          >
            {["Editorial", "Pinterest", "Moodboard", "Trends"].map((item) => (
              <View key={item} style={styles.headerPill}>
                <Text style={styles.headerPillText}>{item}</Text>
              </View>
            ))}
          </ScrollView>
        </LinearGradient>

        <View style={styles.content}>
          {!generatedOutfit ? (
            <>
              <View style={styles.formCard}>
                <Text style={styles.blockTitle}>¿Para qué ocasión?</Text>
                <View style={styles.occasionGrid}>
                  {occasions.map((occ) => {
                    const isSelected = occasion === occ.id;
                    return (
                      <Pressable
                        key={occ.id}
                        onPress={() => setOccasion(occ.id)}
                        style={styles.optionWrapper}
                      >
                        {isSelected ? (
                          <LinearGradient
                            colors={["#4A6FA5", "#8FB8A8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.optionCardActive}
                          >
                            <Text style={styles.optionEmoji}>{occ.emoji}</Text>
                            <Text style={styles.optionLabelActive}>{occ.label}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.optionCard}>
                            <Text style={styles.optionEmoji}>{occ.emoji}</Text>
                            <Text style={styles.optionLabel}>{occ.label}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.blockTitle}>¿Cómo está el clima?</Text>
                <View style={styles.weatherGrid}>
                  {weatherOptions.map((w) => {
                    const isSelected = weather === w.value;
                    return (
                      <Pressable
                        key={w.value}
                        onPress={() => setWeather(w.value)}
                        style={styles.optionWrapper}
                      >
                        {isSelected ? (
                          <LinearGradient
                            colors={["#4A6FA5", "#8FB8A8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.optionCardActive, styles.weatherCardSize]}
                          >
                            <Text style={styles.optionEmojiLarge}>{w.emoji}</Text>
                            <Text style={styles.optionLabelActive}>{w.label}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={[styles.optionCard, styles.weatherCardSize]}>
                            <Text style={styles.optionEmojiLarge}>{w.emoji}</Text>
                            <Text style={styles.optionLabel}>{w.label}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.blockTitle}>¿Qué estilo prefieres?</Text>
                <View style={styles.styleChips}>
                  {styleOptions.map((s) => {
                    const isSelected = style === s.id;
                    return (
                      <Pressable
                        key={s.id}
                        onPress={() => setStyle(s.id)}
                        style={styles.stylePressable}
                      >
                        {isSelected ? (
                          <LinearGradient
                            colors={["#4A6FA5", "#8FB8A8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.styleChipActive}
                          >
                            <Text style={styles.styleChipTextActive}>{s.label}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.styleChip}>
                            <Text style={styles.styleChipText}>{s.label}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.referencesSection}>
                <Text style={styles.sectionTitle}>Referencias de vibe</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {inspirationCards.map((card) => (
                    <LinearGradient
                      key={card.id}
                      colors={card.colors}
                      style={styles.referenceCard}
                    >
                      <View style={styles.referenceIcon}>
                        <Ionicons name={card.icon} size={16} color="#FFFFFF" />
                      </View>
                      <Text style={styles.referenceTitle}>{card.title}</Text>
                      <Text style={styles.referenceSubtitle}>{card.subtitle}</Text>
                    </LinearGradient>
                  ))}
                </ScrollView>
              </View>

              <Pressable
                onPress={handleGenerate}
                disabled={!canGenerate || isGenerating}
                style={styles.generateButtonWrapper}
              >
                {canGenerate && !isGenerating ? (
                  <LinearGradient
                    colors={["#4A6FA5", "#8FB8A8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.generateButton}
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={18}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.generateButtonText}>
                      Generar Outfit Perfecto
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.generateButtonDisabled}>
                    {isGenerating ? (
                      <>
                        <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.generateButtonText}>
                          Creando tu look...
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.generateButtonText}>
                        Generar Outfit Perfecto
                      </Text>
                    )}
                  </View>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.resultHeroCard}>
                <View style={styles.resultHeroHeader}>
                  <View>
                    <Text style={styles.resultEyebrow}>Selección editorial</Text>
                    <Text style={styles.resultHeroTitle}>
                      {generatedOutfit.title}
                    </Text>
                    <Text style={styles.resultHeroSubtitle}>
                      {generatedOutfit.vibe}
                    </Text>
                  </View>

                  <Pressable onPress={generateAnother} style={styles.refreshRound}>
                    <Ionicons name="refresh-outline" size={18} color="#4A6FA5" />
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.optionsRow}
                >
                  {generatedOptions.map((option) => {
                    const active = generatedOutfit.localId === option.localId;
                    const pieces = getGeneratedItems(option);

                    return (
                      <Pressable
                        key={option.localId}
                        onPress={() => setActiveGeneratedId(option.localId)}
                        style={[
                          styles.optionPreviewCard,
                          active && styles.optionPreviewCardActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionPreviewTitle,
                            active && styles.optionPreviewTitleActive,
                          ]}
                          numberOfLines={1}
                        >
                          {option.title}
                        </Text>
                        <Text
                          style={[
                            styles.optionPreviewMeta,
                            active && styles.optionPreviewMetaActive,
                          ]}
                        >
                          {pieces.length} prendas
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Pressable
                  onPress={() => openGeneratedOutfit(generatedOutfit)}
                  style={styles.moodboardContainer}
                >
                  <View style={styles.moodboardColumnLarge}>
                    {getGeneratedItems(generatedOutfit)
                      .slice(0, 2)
                      .map((item, index) => renderPieceCard(item, index))}
                  </View>

                  <View style={styles.moodboardColumnSmall}>
                    {getGeneratedItems(generatedOutfit)
                      .slice(2, 5)
                      .map((item, index) => renderPieceCard(item, index + 2, true))}
                  </View>
                </Pressable>

                <LinearGradient
                  colors={["#EEF4FF", "#F6F7FB"]}
                  style={styles.reasonCard}
                >
                  <View style={styles.reasonRow}>
                    <Ionicons
                      name="sparkles-outline"
                      size={16}
                      color="#4A6FA5"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.reasonTitle}>Por qué funciona</Text>
                  </View>

                  <Text style={styles.reasonText}>
                    {generatedOutfit.reason || generatedOutfit.stylingNote}
                  </Text>

                  <Text style={styles.stylingNoteText}>
                    {generatedOutfit.stylingNote}
                  </Text>
                </LinearGradient>

                <View style={styles.resultActions}>
                  <Pressable onPress={saveGeneratedOutfit} style={styles.saveButtonWrapper}>
                    <LinearGradient
                      colors={["#4A6FA5", "#8FB8A8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.saveButton}
                    >
                      <Ionicons
                        name="heart-outline"
                        size={16}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.saveButtonText}>Guardar Outfit</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    onPress={() => openGeneratedOutfit(generatedOutfit)}
                    style={styles.roundActionButton}
                  >
                    <Ionicons name="expand-outline" size={18} color="#4A6FA5" />
                  </Pressable>
                </View>
              </View>
            </>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Mis colecciones</Text>
              <Text style={styles.sectionCaption}>Looks guardados</Text>
            </View>

            {savedOutfits.length === 0 ? (
              <View style={styles.emptyCollectionCard}>
                <Ionicons name="albums-outline" size={28} color="#AAB7C4" />
                <Text style={styles.emptyCollectionTitle}>
                  Aún no tienes outfits guardados
                </Text>
                <Text style={styles.emptyCollectionText}>
                  Genera tu primer outfit y guárdalo para verlo aquí.
                </Text>
              </View>
            ) : (
              <View style={styles.collectionsGrid}>
                {savedOutfits.map((o) => (
                  <Pressable
                    key={o.id}
                    style={styles.collectionCard}
                    onPress={() => openSavedOutfit(o)}
                  >
                    <View style={styles.collectionImageContainer}>
                      <Image
                        source={{ uri: getOutfitThumbnail(o) || "" }}
                        style={styles.collectionImage}
                        resizeMode="cover"
                      />

                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.38)"]}
                        style={styles.collectionOverlay}
                      />

                      <Pressable
                        style={styles.favoriteButton}
                        onPress={() => toggleFavorite(o.id)}
                      >
                        <Ionicons
                          name={isFavorite(o.id) ? "heart" : "heart-outline"}
                          size={16}
                          color={isFavorite(o.id) ? "#ff4b8b" : "#374151"}
                        />
                      </Pressable>
                    </View>

                    <Text style={styles.collectionName} numberOfLines={1}>
                      {o.name || "Outfit sugerido"}
                    </Text>

                    <Text style={styles.collectionCount}>
                      {o.items.length} prendas
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Favoritos</Text>
              <Text style={styles.sectionCaption}>Tus picks</Text>
            </View>

            {favoriteOutfits.length === 0 ? (
              <Text style={styles.emptyFavoritesText}>
                Aún no tienes favoritos. Toca el corazón de un outfit para verlo aquí.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {favoriteOutfits.map((o) => (
                  <Pressable
                    key={o.id}
                    style={styles.favoriteCard}
                    onPress={() => openSavedOutfit(o)}
                  >
                    <View style={styles.favoriteImageContainer}>
                      <Image
                        source={{ uri: getOutfitThumbnail(o) || "" }}
                        style={styles.favoriteImage}
                        resizeMode="cover"
                      />

                      <Pressable
                        style={styles.favoriteButton}
                        onPress={() => toggleFavorite(o.id)}
                      >
                        <Ionicons
                          name={isFavorite(o.id) ? "heart" : "heart-outline"}
                          size={15}
                          color={isFavorite(o.id) ? "#ff4b8b" : "#374151"}
                        />
                      </Pressable>
                    </View>

                    <Text style={styles.favoriteName} numberOfLines={1}>
                      {o.name || "Outfit sugerido"}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showOutfitModal && !!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOutfitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ width: "100%" }}
          >
            <View style={styles.modalContent}>
              {selected && (
                <>
                  <View style={styles.modalTopBar} />

                  <View style={styles.modalHeaderRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.modalEyebrow}>Detalle del look</Text>
                      <Text style={styles.modalTitle}>{selectedTitle}</Text>
                      <Text style={styles.modalSubtitle}>{selectedSubtitle}</Text>
                    </View>

                    <Pressable
                      style={styles.modalCloseButton}
                      onPress={() => setShowOutfitModal(false)}
                    >
                      <Ionicons name="close" size={22} color="#1F2A44" />
                    </Pressable>
                  </View>

                  <ScrollView
                    style={{ marginTop: 12, maxHeight: 420 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.modalPiecesGrid}>
                      {selectedItems.map((item, index) => (
                        <View key={`${item.id}-${index}`} style={styles.modalPieceCard}>
                          <Image
                            source={{ uri: getItemImageUrl(item) || "" }}
                            style={styles.modalPieceImage}
                            resizeMode="cover"
                          />
                          <LinearGradient
                            colors={["transparent", "rgba(15,23,42,0.60)"]}
                            style={styles.modalPieceOverlay}
                          />
                          <View style={styles.modalPieceInfoOverlay}>
                            <Text style={styles.modalPieceName} numberOfLines={1}>
                              {item.type || "Prenda"}
                            </Text>
                            <Text style={styles.modalPieceMeta} numberOfLines={1}>
                              {item.category || "detalle"} · {item.color || "sin color"}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>

                  {selected.kind === "generated" && (
                    <View style={styles.generatedInfoBox}>
                      <Text style={styles.generatedInfoTitle}>Styling note</Text>
                      <Text style={styles.generatedInfoText}>
                        {selected.data.stylingNote || selected.data.reason}
                      </Text>
                    </View>
                  )}

                  {selected.kind === "saved" && (
                    <>
                      <Pressable
                        style={[styles.modalActionButton, { backgroundColor: "#22A2DD" }]}
                        onPress={() =>
                          takePhotoAndUpdateOutfit(selected.data.id, false)
                        }
                      >
                        <Ionicons
                          name="camera-outline"
                          size={18}
                          color="#fff"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.modalActionButtonText}>
                          Tomar foto del outfit
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[styles.modalActionButton, { backgroundColor: "#5B4BE8" }]}
                        onPress={openPublishModal}
                      >
                        <Ionicons
                          name="cloud-upload-outline"
                          size={18}
                          color="#fff"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.modalActionButtonText}>
                          Tomar foto y publicar
                        </Text>
                      </Pressable>

                      <Pressable
                        style={styles.deleteOutlineButton}
                        onPress={deleteSelectedOutfit}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#D92D20"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.deleteOutlineButtonText}>
                          Eliminar outfit
                        </Text>
                      </Pressable>
                    </>
                  )}

                  <Pressable
                    style={[styles.modalActionButton, { backgroundColor: "#DDE3EB" }]}
                    onPress={() => setShowOutfitModal(false)}
                  >
                    <Text style={[styles.modalActionButtonText, { color: "#4A6FA5" }]}>
                      Cerrar
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={publishModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPublishModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.publishModalContent}>
            <Text style={styles.publishTitle}>Publicar en Explorar</Text>
            <Text style={styles.publishSubtitle}>
              Elige el nombre de tu publicación:
            </Text>

            <TextInput
              style={styles.publishInput}
              placeholder="Ej. Outfit para brunch"
              placeholderTextColor="#9ca3af"
              value={publishTitle}
              onChangeText={setPublishTitle}
            />

            <View style={styles.publishButtonsRow}>
              <Pressable
                style={[styles.publishButton, { backgroundColor: "#e5e7eb" }]}
                onPress={() => setPublishModalVisible(false)}
              >
                <Text style={[styles.publishButtonText, { color: "#111827" }]}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={[styles.publishButton, { backgroundColor: "#4f46e5" }]}
                onPress={confirmPublish}
              >
                <Text style={styles.publishButtonText}>Tomar foto y publicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    paddingTop: 52,
    paddingHorizontal: 22,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopBadge: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.92)",
    maxWidth: "95%",
  },
  headerPills: {
    paddingTop: 14,
    paddingRight: 14,
  },
  headerPill: {
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  headerPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  content: {
    marginTop: -6,
    paddingHorizontal: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  blockTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F2A44",
    marginBottom: 14,
  },
  occasionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionWrapper: {
    width: "31.5%",
    marginBottom: 12,
  },
  optionCard: {
    minHeight: 116,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  optionCardActive: {
    minHeight: 116,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  weatherCardSize: {
    minHeight: 136,
  },
  optionEmoji: {
    fontSize: 26,
    marginBottom: 8,
  },
  optionEmojiLarge: {
    fontSize: 30,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  optionLabelActive: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  styleChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  stylePressable: {
    marginRight: 8,
    marginBottom: 10,
  },
  styleChip: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  styleChipActive: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  styleChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  styleChipTextActive: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  referencesSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2A44",
    marginBottom: 12,
  },
  referenceCard: {
    width: 210,
    minHeight: 122,
    borderRadius: 22,
    padding: 16,
    marginRight: 10,
    justifyContent: "flex-end",
  },
  referenceIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  referenceSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.92)",
  },
  generateButtonWrapper: {
    marginBottom: 22,
  },
  generateButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#4A6FA5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  generateButtonDisabled: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#C7CDD6",
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resultHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  resultHeroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  resultEyebrow: {
    fontSize: 11,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: "700",
  },
  resultHeroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2A44",
    marginBottom: 3,
    maxWidth: "88%",
  },
  resultHeroSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  refreshRound: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsRow: {
    paddingBottom: 10,
    paddingRight: 8,
  },
  optionPreviewCard: {
    minWidth: 124,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionPreviewCardActive: {
    backgroundColor: "#EEF4FF",
    borderColor: "#93C5FD",
  },
  optionPreviewTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  optionPreviewTitleActive: {
    color: "#1D4ED8",
  },
  optionPreviewMeta: {
    fontSize: 11,
    color: "#64748B",
  },
  optionPreviewMetaActive: {
    color: "#2563EB",
  },
  moodboardContainer: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 14,
  },
  moodboardColumnLarge: {
    flex: 1.15,
    marginRight: 10,
  },
  moodboardColumnSmall: {
    flex: 0.88,
    justifyContent: "space-between",
  },
  moodPieceCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },
  moodPieceImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#DDE5EC",
  },
  moodPieceOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  moodPieceMeta: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
  },
  moodPieceTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  moodPieceSubtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
  },
  reasonCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#274472",
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
    marginBottom: 6,
  },
  stylingNoteText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
  resultActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonWrapper: {
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  roundActionButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 26,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  sectionCaption: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyCollectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
  },
  emptyCollectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2A44",
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyCollectionText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
    textAlign: "center",
  },
  collectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  collectionCard: {
    width: "48%",
    marginBottom: 16,
  },
  collectionImageContainer: {
    aspectRatio: 0.9,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    position: "relative",
  },
  collectionImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
  },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2A44",
  },
  collectionCount: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyFavoritesText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  favoriteCard: {
    width: 146,
    marginRight: 12,
  },
  favoriteImageContainer: {
    width: 146,
    height: 188,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    position: "relative",
  },
  favoriteImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
  },
  favoriteName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2A44",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  modalContent: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 14,
  },
  modalTopBar: {
    width: 56,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  modalEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8FB8A8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  modalCloseButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalPiecesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  modalPieceCard: {
    width: "48%",
    height: 188,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  modalPieceImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  modalPieceOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalPieceInfoOverlay: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
  },
  modalPieceName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  modalPieceMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
  },
  generatedInfoBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  generatedInfoTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  generatedInfoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },
  modalActionButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  modalActionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  deleteOutlineButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D92D20",
    backgroundColor: "#FFF5F5",
  },
  deleteOutlineButtonText: {
    color: "#D92D20",
    fontWeight: "700",
    fontSize: 14,
  },
  publishModalContent: {
    width: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },
  publishTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  publishSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  publishInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    marginBottom: 14,
  },
  publishButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  publishButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 8,
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});