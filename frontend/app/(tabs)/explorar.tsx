// app/(tabs)/explorar.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Image,
//   ActivityIndicator,
//   Modal,
//   FlatList,
//   Alert,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { get, post, put, del, API_URL } from "../../src/api";
// import { useAuth } from "../../src/contexts/auth";

// type ExploreLike = {
//   userId: string;
// };

// type ExploreComment = {
//   id: string;
//   content: string;
//   createdAt: string;
//   userId: string;
//   user: {
//     id: string;
//     name: string | null;
//   };
// };

// type ExplorePost = {
//   id: string;
//   title: string;
//   imageUrl: string;
//   style: string | null;
//   likes: number;
//   saves: number;
//   createdAt: string;
//   userId: string;
//   user: {
//     id: string;
//     name: string | null;
//   };
//   outfit: {
//     id: string;
//     items: { prenda: { id: number; type: string | null; color: string | null } }[];
//     photos: { id: string; url: string }[];
//   };
//   likesList: ExploreLike[];
//   comments: ExploreComment[];
// };

// const FILTERS = ["Tendencias", "Casual", "Formal", "Deportivo"];

// export default function ExplorarScreen() {
//   const { user } = useAuth();

//   const [activeFilter, setActiveFilter] = useState<string>("Tendencias");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [posts, setPosts] = useState<ExplorePost[]>([]);

//   // Comentarios
//   const [commentModalVisible, setCommentModalVisible] = useState(false);
//   const [selectedPost, setSelectedPost] = useState<ExplorePost | null>(null);
//   const [commentText, setCommentText] = useState("");

//   // Editar publicación
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editTitle, setEditTitle] = useState("");

//   // ----------- Cargar posts -----------
//   const loadPosts = async (styleFilter: string) => {
//     try {
//       setLoading(true);
//       const query = styleFilter
//         ? `?style=${encodeURIComponent(styleFilter)}`
//         : "";

//       const data = await get(`/api/explore/outfits${query}`);
//       setPosts(data.posts || []);
//     } catch (err) {
//       console.error("Error cargando explore:", err);
//       Alert.alert("Error", "No se pudieron cargar las publicaciones");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadPosts(activeFilter);
//   }, [activeFilter]);

//   // ----------- Filtro de búsqueda -----------
//   const filteredPosts = useMemo(() => {
//     const term = search.toLowerCase().trim();
//     if (!term) return posts;
//     return posts.filter((p) => {
//       const title = p.title?.toLowerCase() || "";
//       const author = p.user?.name?.toLowerCase() || "";
//       const style = p.style?.toLowerCase() || "";
//       return (
//         title.includes(term) || author.includes(term) || style.includes(term)
//       );
//     });
//   }, [posts, search]);

//   // Helpers
//   const getMainImage = (post: ExplorePost) => {
//     if (post.imageUrl) {
//       if (post.imageUrl.startsWith("http")) return post.imageUrl;
//       return `${API_URL}${post.imageUrl}`;
//     }
//     if (post.outfit?.photos?.[0]?.url) {
//       const url = post.outfit.photos[0].url;
//       if (url.startsWith("http")) return url;
//       return `${API_URL}${url}`;
//     }
//     return null;
//   };

//   const hasLiked = (post: ExplorePost): boolean => {
//     if (!user?.id) return false;
//     return post.likesList.some((l) => l.userId === user.id);
//   };

//   const isOwner = (post: ExplorePost): boolean => {
//     return !!user?.id && post.userId === user.id;
//   };

//   // ----------- Likes -----------
//   const handleToggleLike = async (postItem: ExplorePost) => {
//     if (!user?.id) {
//       Alert.alert("Inicia sesión", "Necesitas iniciar sesión para dar like.");
//       return;
//     }

//     const liked = hasLiked(postItem);

//     try {
//       if (liked) {
//         // Quitar like
//         await del(`/api/explore/${postItem.id}/like`, { userId: user.id });

//         setPosts((prev) =>
//           prev.map((p) =>
//             p.id === postItem.id
//               ? {
//                   ...p,
//                   likes: Math.max(0, p.likes - 1),
//                   likesList: p.likesList.filter((l) => l.userId !== user.id),
//                 }
//               : p
//           )
//         );
//       } else {
//         // Dar like
//         await post(`/api/explore/${postItem.id}/like`, { userId: user.id });

//         setPosts((prev) =>
//           prev.map((p) =>
//             p.id === postItem.id
//               ? {
//                   ...p,
//                   likes: p.likes + 1,
//                   likesList: [...p.likesList, { userId: user.id! }],
//                 }
//               : p
//           )
//         );
//       }
//     } catch (err) {
//       console.error("Error like/unlike:", err);
//       Alert.alert("Error", "No se pudo actualizar el like.");
//     }
//   };


//   // ----------- Comentarios -----------
//   const openComments = (post: ExplorePost) => {
//     setSelectedPost(post);
//     setCommentText("");
//     setCommentModalVisible(true);
//   };

//   const handleSendComment = async () => {
//     if (!selectedPost || !user?.id) {
//       Alert.alert("Error", "No se pudo enviar el comentario.");
//       return;
//     }
//     if (!commentText.trim()) return;

//     try {
//       const data = await post(`/api/explore/${selectedPost.id}/comment`, {
//         userId: user.id,
//         content: commentText.trim(),
//       });

//       const newComment: ExploreComment = data.comment;

//       setPosts((prev) =>
//         prev.map((p) =>
//           p.id === selectedPost.id
//             ? { ...p, comments: [...p.comments, newComment] }
//             : p
//         )
//       );

//       setSelectedPost((prev) =>
//         prev
//           ? { ...prev, comments: [...prev.comments, newComment] }
//           : prev
//       );

//       setCommentText("");
//     } catch (err) {
//       console.error("Error enviando comentario:", err);
//       Alert.alert("Error", "No se pudo enviar el comentario.");
//     }
//   };

//   // ----------- Editar / eliminar ----------
//   const openOwnerOptions = (post: ExplorePost) => {
//     if (!isOwner(post)) return;

//     Alert.alert("Publicación", "¿Qué quieres hacer?", [
//       {
//         text: "Editar título",
//         onPress: () => {
//           setSelectedPost(post);
//           setEditTitle(post.title);
//           setEditModalVisible(true);
//         },
//       },
//       {
//         text: "Eliminar",
//         style: "destructive",
//         onPress: () => handleDeletePost(post),
//       },
//       { text: "Cancelar", style: "cancel" },
//     ]);
//   };

//   const handleSaveEdit = async () => {
//     if (!selectedPost || !user?.id) return;
//     const newTitle = editTitle.trim();
//     if (!newTitle) {
//       Alert.alert("Error", "El título no puede estar vacío.");
//       return;
//     }

//     try {
//       const data = await put(`/api/explore/${selectedPost.id}`, {
//         userId: user.id,
//         title: newTitle,
//         style: selectedPost.style,
//       });

//       const updated = data.post;

//       setPosts((prev) =>
//         prev.map((p) =>
//           p.id === selectedPost.id ? { ...p, title: updated.title } : p
//         )
//       );

//       setSelectedPost((prev) =>
//         prev ? { ...prev, title: updated.title } : prev
//       );

//       setEditModalVisible(false);
//     } catch (err) {
//       console.error("Error al editar publicación:", err);
//       Alert.alert("Error", "No se pudo editar la publicación.");
//     }
//   };

//   const handleDeletePost = async (post: ExplorePost) => {
//     if (!user?.id) return;

//     try {
//       await del(`/api/explore/${post.id}`, { userId: user.id });

//       setPosts((prev) => prev.filter((p) => p.id !== post.id));

//       if (selectedPost?.id === post.id) {
//         setSelectedPost(null);
//         setCommentModalVisible(false);
//       }
//     } catch (err) {
//       console.error("Error eliminando publicación:", err);
//       Alert.alert("Error", "No se pudo eliminar la publicación.");
//     }
//   };

//   // ----------- Render de una card ----------
//   const renderPostCard = (post: ExplorePost) => {
//     const liked = hasLiked(post);
//     const mainImage = getMainImage(post);

//     return (
//       <View key={post.id} style={styles.card}>
//         {/* Imagen principal */}
//         {mainImage ? (
//           <Image
//             source={{ uri: mainImage }}
//             style={styles.cardImage}
//             resizeMode="cover"
//           />
//         ) : (
//           <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
//         )}

//         {/* Header con título y menú dueño */}
//         <View style={styles.cardBody}>
//           <View style={styles.cardHeaderRow}>
//             <View>
//               <Text style={styles.cardTitle}>{post.title}</Text>
//               <Text style={styles.cardMeta}>
//                 {post.outfit?.items?.length || 0} prendas ·{" "}
//                 {post.style || "Estilo libre"}
//               </Text>
//               <Text style={styles.cardAuthor}>
//                 por {post.user?.name || "Usuario"}
//               </Text>
//             </View>

//             {isOwner(post) && (
//               <TouchableOpacity
//                 style={styles.cardMenuButton}
//                 onPress={() => openOwnerOptions(post)}
//               >
//                 <Ionicons name="ellipsis-vertical" size={18} color="#6b7280" />
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Chip de estilo */}
//           {post.style && (
//             <View style={styles.styleChip}>
//               <Ionicons name="flame-outline" size={14} color="#ea580c" />
//               <Text style={styles.styleChipText}>{post.style}</Text>
//             </View>
//           )}

//           {/* Row likes / comentarios */}
//           <View style={styles.cardFooterRow}>
//             <TouchableOpacity
//               style={styles.iconRow}
//               onPress={() => handleToggleLike(post)}
//             >
//               <Ionicons
//                 name={liked ? "heart" : "heart-outline"}
//                 size={20}
//                 color={liked ? "#f97373" : "#4b5563"}
//               />
//               <Text
//                 style={[
//                   styles.iconText,
//                   liked && { color: "#f97373", fontWeight: "600" },
//                 ]}
//               >
//                 {post.likes}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.iconRow}
//               onPress={() => openComments(post)}
//             >
//               <Ionicons
//                 name="chatbubble-ellipses-outline"
//                 size={20}
//                 color="#4b5563"
//               />
//               <Text style={styles.iconText}>{post.comments.length}</Text>
//             </TouchableOpacity>

//             <View style={[styles.iconRow, { marginLeft: "auto" }]}>
//               <Ionicons
//                 name="share-social-outline"
//                 size={20}
//                 color="#4b5563"
//               />
//             </View>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   // ------------- RENDER PRINCIPAL -------------
//   return (
//     <>
//       <ScrollView style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Explorar</Text>
//           <Text style={styles.headerSubtitle}>
//             Descubre outfits de otros usuarios
//           </Text>
//         </View>

//         {/* Buscador */}
//         <View style={styles.searchBox}>
//           <Ionicons name="search-outline" size={18} color="#9ca3af" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Buscar inspiración..."
//             placeholderTextColor="#9ca3af"
//             value={search}
//             onChangeText={setSearch}
//           />
//         </View>

//         {/* Filtros */}
//         <View style={styles.filtersRow}>
//           {FILTERS.map((f) => (
//             <TouchableOpacity
//               key={f}
//               style={[
//                 styles.filterChip,
//                 activeFilter === f && styles.filterChipActive,
//               ]}
//               onPress={() => setActiveFilter(f)}
//             >
//               <Text
//                 style={[
//                   styles.filterChipText,
//                   activeFilter === f && styles.filterChipTextActive,
//                 ]}
//               >
//                 {f}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Contenido */}
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#4f46e5" />
//             <Text style={styles.loadingText}>Cargando tendencias...</Text>
//           </View>
//         ) : filteredPosts.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Ionicons name="sparkles-outline" size={42} color="#9ca3af" />
//             <Text style={styles.emptyTitle}>Sin publicaciones</Text>
//             <Text style={styles.emptyText}>
//               Aún no hay outfits para este filtro. ¡Sé la primera en publicar!
//             </Text>
//           </View>
//         ) : (
//           <View style={styles.listContainer}>
//             {filteredPosts.map((post) => renderPostCard(post))}
//           </View>
//         )}
//       </ScrollView>

//       {/* ===== MODAL COMENTARIOS ===== */}
//       <Modal
//         visible={commentModalVisible && !!selectedPost}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setCommentModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.commentsModal}>
//             {selectedPost && (
//               <>
//                 <Text style={styles.modalTitle}>Comentarios</Text>
//                 <Text style={styles.modalSubtitle}>{selectedPost.title}</Text>

//                 <FlatList
//                   style={{ marginTop: 10, maxHeight: 260 }}
//                   data={selectedPost.comments}
//                   keyExtractor={(c) => c.id}
//                   ListEmptyComponent={
//                     <Text style={styles.modalEmptyText}>
//                       Aún no hay comentarios. ¡Escribe el primero!
//                     </Text>
//                   }
//                   renderItem={({ item }) => (
//                     <View style={styles.commentRow}>
//                       <View style={styles.commentAvatar}>
//                         <Text style={styles.commentAvatarText}>
//                           {item.user?.name?.[0]?.toUpperCase() || "U"}
//                         </Text>
//                       </View>
//                       <View style={{ flex: 1 }}>
//                         <Text style={styles.commentAuthor}>
//                           {item.user?.name || "Usuario"}
//                         </Text>
//                         <Text style={styles.commentText}>{item.content}</Text>
//                       </View>
//                     </View>
//                   )}
//                 />

//                 {/* Input comentario */}
//                 <View style={styles.commentInputRow}>
//                   <TextInput
//                     style={styles.commentInput}
//                     placeholder="Escribe un comentario..."
//                     placeholderTextColor="#9ca3af"
//                     value={commentText}
//                     onChangeText={setCommentText}
//                   />
//                   <TouchableOpacity
//                     style={styles.commentSendButton}
//                     onPress={handleSendComment}
//                   >
//                     <Ionicons name="send" size={18} color="#fff" />
//                   </TouchableOpacity>
//                 </View>

//                 <TouchableOpacity
//                   style={styles.modalCloseButton}
//                   onPress={() => setCommentModalVisible(false)}
//                 >
//                   <Text style={styles.modalCloseButtonText}>Cerrar</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* ===== MODAL EDITAR PUBLICACIÓN ===== */}
//       <Modal
//         visible={editModalVisible && !!selectedPost}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setEditModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.editModal}>
//             <Text style={styles.modalTitle}>Editar publicación</Text>
//             <Text style={styles.modalSubtitle}>
//               Cambia el título de tu publicación en Explorar.
//             </Text>

//             <TextInput
//               style={styles.editInput}
//               value={editTitle}
//               onChangeText={setEditTitle}
//               placeholder="Título del outfit"
//               placeholderTextColor="#9ca3af"
//             />

//             <View style={styles.editButtonsRow}>
//               <TouchableOpacity
//                 style={[styles.editButton, { backgroundColor: "#e5e7eb" }]}
//                 onPress={() => setEditModalVisible(false)}
//               >
//                 <Text
//                   style={[styles.editButtonText, { color: "#111827" }]}
//                 >
//                   Cancelar
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.editButton, { backgroundColor: "#4f46e5" }]}
//                 onPress={handleSaveEdit}
//               >
//                 <Text style={styles.editButtonText}>Guardar</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// // ----------- ESTILOS -----------
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//   },
//   header: {
//     paddingTop: 60,
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: "800",
//     color: "#111827",
//   },
//   headerSubtitle: {
//     marginTop: 4,
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   searchBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#e5e7eb",
//     marginHorizontal: 20,
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 14,
//     color: "#111827",
//   },
//   filtersRow: {
//     flexDirection: "row",
//     paddingHorizontal: 20,
//     marginTop: 14,
//     marginBottom: 8,
//   },
//   filterChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 999,
//     backgroundColor: "#e5e7eb",
//     marginRight: 8,
//   },
//   filterChipActive: {
//     backgroundColor: "#4f46e5",
//   },
//   filterChipText: {
//     fontSize: 13,
//     color: "#374151",
//   },
//   filterChipTextActive: {
//     color: "white",
//     fontWeight: "600",
//   },
//   listContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 80,
//   },
//   card: {
//     backgroundColor: "white",
//     borderRadius: 20,
//     marginBottom: 16,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardImage: {
//     width: "100%",
//     height: 240,
//   },
//   cardImagePlaceholder: {
//     backgroundColor: "#e5e7eb",
//   },
//   cardBody: {
//     padding: 14,
//   },
//   cardHeaderRow: {
//     flexDirection: "row",
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   cardMeta: {
//     fontSize: 13,
//     color: "#6b7280",
//   },
//   cardAuthor: {
//     fontSize: 12,
//     color: "#9ca3af",
//     marginTop: 2,
//   },
//   cardMenuButton: {
//     marginLeft: "auto",
//     padding: 4,
//   },
//   styleChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "flex-start",
//     marginTop: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 999,
//     backgroundColor: "#ffedd5",
//   },
//   styleChipText: {
//     marginLeft: 4,
//     color: "#ea580c",
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   cardFooterRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   iconRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   iconText: {
//     marginLeft: 4,
//     fontSize: 13,
//     color: "#4b5563",
//   },
//   loadingContainer: {
//     paddingTop: 40,
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   emptyContainer: {
//     marginTop: 40,
//     alignItems: "center",
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     marginTop: 10,
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   emptyText: {
//     marginTop: 4,
//     fontSize: 14,
//     color: "#6b7280",
//     textAlign: "center",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   commentsModal: {
//     width: "90%",
//     borderRadius: 18,
//     backgroundColor: "white",
//     padding: 16,
//   },
//   editModal: {
//     width: "85%",
//     borderRadius: 18,
//     backgroundColor: "white",
//     padding: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   modalSubtitle: {
//     fontSize: 13,
//     color: "#6b7280",
//     marginTop: 2,
//   },
//   modalEmptyText: {
//     marginTop: 12,
//     fontSize: 13,
//     color: "#9ca3af",
//   },
//   modalCloseButton: {
//     marginTop: 10,
//     backgroundColor: "#4f46e5",
//     borderRadius: 999,
//     paddingVertical: 10,
//     alignItems: "center",
//   },
//   modalCloseButtonText: {
//     color: "white",
//     fontWeight: "600",
//   },
//   commentRow: {
//     flexDirection: "row",
//     marginBottom: 8,
//     marginTop: 6,
//   },
//   commentAvatar: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: "#e5e7eb",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 8,
//   },
//   commentAvatarText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#374151",
//   },
//   commentAuthor: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   commentText: {
//     fontSize: 13,
//     color: "#4b5563",
//   },
//   commentInputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 12,
//   },
//   commentInput: {
//     flex: 1,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     fontSize: 13,
//     color: "#111827",
//   },
//   commentSendButton: {
//     marginLeft: 8,
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#4f46e5",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   editInput: {
//     marginTop: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     fontSize: 14,
//     color: "#111827",
//   },
//   editButtonsRow: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 14,
//     gap: 8,
//   } as any,
//   editButton: {
//     borderRadius: 999,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//   },
//   editButtonText: {
//     color: "white",
//     fontWeight: "600",
//     fontSize: 13,
//   },
// });

// frontend/app/(tabs)/explorar.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";

import { get, post, put, del, API_URL } from "../../src/api";
import { useAuth } from "../../src/contexts/auth";

type ExploreLike = {
  userId: string;
};

type ExploreComment = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
  };
};

type ExplorePost = {
  id: string;
  title: string;
  imageUrl: string;
  style: string | null;
  likes: number;
  saves: number;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
  };
  outfit?: {
    id: string;
    items?: {
      prenda: {
        id: number;
        type: string | null;
        color: string | null;
      };
    }[];
    photos?: {
      id: string;
      url: string;
    }[];
  };
  likesList: ExploreLike[];
  comments: ExploreComment[];
};

const FILTERS = [
  { id: "Tendencias", label: "Descubrir", icon: "search-outline" as const },
  { id: "Casual", label: "Casual", icon: "sparkles-outline" as const },
  { id: "Formal", label: "Formal", icon: "diamond-outline" as const },
  { id: "Deportivo", label: "Deportivo", icon: "barbell-outline" as const },
];

export default function ExplorarScreen() {
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<string>("Tendencias");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<ExplorePost[]>([]);

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ExplorePost | null>(null);
  const [commentText, setCommentText] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const trendingHashtags = [
    { tag: "MinimalChic", count: "2.4k" },
    { tag: "SummerVibes", count: "1.8k" },
    { tag: "StreetStyle", count: "3.2k" },
    { tag: "Vintage", count: "1.5k" },
    { tag: "Elegante", count: "2.1k" },
  ];

  const normalizePost = (postItem: any): ExplorePost => {
    return {
      ...postItem,
      imageUrl: postItem.imageUrl || postItem.image_url || "",
      likes: postItem.likes ?? 0,
      saves: postItem.saves ?? 0,
      likesList: postItem.likesList || [],
      comments: postItem.comments || [],
      userId: postItem.userId || postItem.user_id || "",
      user: postItem.user || {
        id: postItem.userId || postItem.user_id || "",
        name: "Usuario",
      },
      outfit: postItem.outfit || {
        id: "",
        items: [],
        photos: [],
      },
    };
  };

  const getErrorMessage = (err: any) => {
    return (
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Ocurrió un error"
    );
  };

  const loadPosts = async (styleFilter: string) => {
    try {
      setLoading(true);

      const query =
        styleFilter && styleFilter !== "Tendencias"
          ? `?style=${encodeURIComponent(styleFilter)}`
          : "";

      const data = await get(`/api/explore/outfits${query}`);

      const postsData = Array.isArray(data) ? data : data?.posts || [];

      setPosts(postsData.map(normalizePost));
    } catch (err) {
      console.error("Error cargando explore:", err);
      Alert.alert("Error", "No se pudieron cargar las publicaciones.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadPosts(activeFilter);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts(activeFilter);
  }, [activeFilter]);

  useFocusEffect(
    useCallback(() => {
      loadPosts(activeFilter);
    }, [activeFilter])
  );

  const filteredPosts = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return posts;

    return posts.filter((p) => {
      const title = p.title?.toLowerCase() || "";
      const author = p.user?.name?.toLowerCase() || "";
      const style = p.style?.toLowerCase() || "";

      return title.includes(term) || author.includes(term) || style.includes(term);
    });
  }, [posts, search]);

  const getMainImage = (postItem: ExplorePost) => {
    if (postItem.imageUrl) {
      if (postItem.imageUrl.startsWith("http")) return postItem.imageUrl;
      return `${API_URL}${postItem.imageUrl}`;
    }

    if (postItem.outfit?.photos?.[0]?.url) {
      const url = postItem.outfit.photos[0].url;

      if (url.startsWith("http")) return url;
      return `${API_URL}${url}`;
    }

    return "https://via.placeholder.com/400x500?text=Sin+imagen";
  };

  const hasLiked = (postItem: ExplorePost): boolean => {
    if (!user?.id) return false;

    return (postItem.likesList || []).some(
      (like) => String(like.userId) === String(user.id)
    );
  };

  const isOwner = (postItem: ExplorePost): boolean => {
    if (!user?.id) return false;

    return String(postItem.userId) === String(user.id);
  };

  const handleSharePost = async (postItem: ExplorePost) => {
    try {
      const author = postItem.user?.name || "un usuario";
      const style = postItem.style ? ` estilo ${postItem.style}` : "";
      const title = postItem.title || "Outfit sugerido";

      const message =
        `Mira este outfit en Closi ✨\n\n` +
        `"${title}" de ${author}${style}.\n\n` +
        `Closi te ayuda a organizar tu armario y crear outfits con tu estilo.`;

      await Share.share({
        title: "Compartir outfit",
        message,
      });
    } catch (error) {
      console.error("Error compartiendo publicación:", error);
      Alert.alert("Error", "No se pudo compartir la publicación.");
    }
  };

  const handleLike = async (postItem: ExplorePost) => {
    if (!user?.id) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para dar like.");
      return;
    }

    const alreadyLiked = hasLiked(postItem);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postItem.id) return p;

        return {
          ...p,
          likes: alreadyLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
          likesList: alreadyLiked
            ? p.likesList.filter((l) => String(l.userId) !== String(user.id))
            : [...p.likesList, { userId: String(user.id) }],
        };
      })
    );

    try {
      await post(`/api/explore/outfits/${postItem.id}/like`, {
        userId: user.id,
      });
    } catch (err) {
      console.error("Error dando like:", err);
      await loadPosts(activeFilter);
    }
  };

  const openComments = (postItem: ExplorePost) => {
    setSelectedPost(postItem);
    setCommentText("");
    setCommentModalVisible(true);
  };

  const handleCreateComment = async () => {
    if (!user?.id) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para comentar.");
      return;
    }

    if (!selectedPost?.id) return;

    if (!commentText.trim()) {
      Alert.alert("Comentario vacío", "Escribe un comentario.");
      return;
    }

    try {
      const response = await post(
        `/api/explore/outfits/${selectedPost.id}/comments`,
        {
          userId: user.id,
          content: commentText.trim(),
        }
      );

      const newComment = response?.comment || {
        id: String(Date.now()),
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
        userId: String(user.id),
        user: {
          id: String(user.id),
          name: user.name || "Usuario",
        },
      };

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? {
                ...p,
                comments: [...(p.comments || []), newComment],
              }
            : p
        )
      );

      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), newComment],
            }
          : prev
      );

      setCommentText("");
    } catch (err) {
      console.error("Error comentando:", err);
      Alert.alert("Error", getErrorMessage(err));
    }
  };

  const openEditModal = (postItem: ExplorePost) => {
    if (!user?.id) {
      Alert.alert("Error", "Debes iniciar sesión.");
      return;
    }

    if (!isOwner(postItem)) {
      Alert.alert(
        "No autorizado",
        "Solo puedes editar tus propias publicaciones."
      );
      return;
    }

    setSelectedPost(postItem);
    setEditTitle(postItem.title || "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPost?.id) return;

    if (!editTitle.trim()) {
      Alert.alert("Título vacío", "Escribe un título para tu publicación.");
      return;
    }

    setSavingEdit(true);

    try {
      const response = await put(`/api/explore/outfits/${selectedPost.id}`, {
        title: editTitle.trim(),
      });

      const updatedPost = normalizePost(response?.post || response);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? {
                ...p,
                ...updatedPost,
                title: updatedPost.title || editTitle.trim(),
              }
            : p
        )
      );

      setEditModalVisible(false);
      setSelectedPost(null);
      setEditTitle("");

      Alert.alert("Listo", "La publicación se actualizó correctamente.");
    } catch (err) {
      console.error("Error editando post:", err);
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePost = (postItem: ExplorePost) => {
    if (!isOwner(postItem)) {
      Alert.alert(
        "No autorizado",
        "Solo puedes eliminar tus propias publicaciones."
      );
      return;
    }

    Alert.alert(
      "Eliminar publicación",
      "¿Seguro que quieres eliminar esta publicación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDeletingPostId(postItem.id);

            try {
              await del(`/api/explore/outfits/${postItem.id}`);

              setPosts((prev) => prev.filter((p) => p.id !== postItem.id));

              Alert.alert("Eliminada", "La publicación se eliminó correctamente.");
            } catch (err) {
              console.error("Error eliminando post:", err);
              Alert.alert("Error", getErrorMessage(err));
            } finally {
              setDeletingPostId(null);
            }
          },
        },
      ]
    );
  };

  const showOwnerOptions = (postItem: ExplorePost) => {
    Alert.alert("Opciones de publicación", "¿Qué quieres hacer?", [
      {
        text: "Editar",
        onPress: () => openEditModal(postItem),
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => handleDeletePost(postItem),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  const renderPost = (postItem: ExplorePost) => {
    const liked = hasLiked(postItem);
    const owner = isOwner(postItem);
    const imageUrl = getMainImage(postItem);

    return (
      <View key={postItem.id} style={styles.postCard}>
        <Image source={{ uri: imageUrl }} style={styles.postImage} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.82)"]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 0, y: 1 }}
          style={styles.postOverlay}
        />

        <View style={styles.postTopActions}>
          {owner ? (
            <>
              <Pressable
                style={styles.floatingButton}
                onPress={() => openEditModal(postItem)}
              >
                <Ionicons name="create-outline" size={22} color="#1F2A44" />
              </Pressable>

              <Pressable
                style={styles.floatingButtonDanger}
                onPress={() => handleDeletePost(postItem)}
                disabled={deletingPostId === postItem.id}
              >
                {deletingPostId === postItem.id ? (
                  <ActivityIndicator color="#EF4444" size="small" />
                ) : (
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                )}
              </Pressable>
            </>
          ) : null}
        </View>

        <View style={styles.postAuthorRow}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarLetter}>
              {(postItem.user?.name || "U").charAt(0).toUpperCase()}
            </Text>
          </View>

          <View>
            <Text style={styles.authorName}>
              {postItem.user?.name || "Usuario"}
            </Text>

            <Text style={styles.postStyle}>{postItem.style || "outfit"}</Text>
          </View>
        </View>

        <View style={styles.postBottom}>
          <Text style={styles.postTitle}>{postItem.title || "Outfit sugerido"}</Text>

          <View style={styles.actionsRow}>
            <Pressable style={styles.actionButton} onPress={() => handleLike(postItem)}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={29}
                color={liked ? "#FF5A8A" : "#FFFFFF"}
              />
              <Text style={styles.actionText}>{postItem.likes || 0}</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => openComments(postItem)}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={28}
                color="#FFFFFF"
              />
              <Text style={styles.actionText}>
                {postItem.comments?.length || 0}
              </Text>
            </Pressable>

            <View style={{ flex: 1 }} />

            <Pressable
              style={styles.shareButton}
              onPress={() => handleSharePost(postItem)}
            >
              <Ionicons name="share-social-outline" size={27} color="#FFFFFF" />
            </Pressable>

            {owner ? (
              <Pressable
                style={styles.moreButton}
                onPress={() => showOwnerOptions(postItem)}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <LinearGradient
          colors={["#4A6FA5", "#8FB8A8", "#A78BFA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Explorar</Text>
              <Text style={styles.headerSubtitle}>
                Inspírate con looks de la comunidad
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons name="compass-outline" size={26} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.searchCard}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar outfits, estilos o usuarios..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />

            {search.trim() ? (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close" size={20} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {FILTERS.map((filter) => {
              const active = activeFilter === filter.id;

              return (
                <Pressable
                  key={filter.id}
                  onPress={() => setActiveFilter(filter.id)}
                  style={styles.filterPressable}
                >
                  {active ? (
                    <LinearGradient
                      colors={["#4A6FA5", "#8FB8A8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.filterActive}
                    >
                      <Ionicons name={filter.icon} size={17} color="#FFFFFF" />
                      <Text style={styles.filterActiveText}>{filter.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.filterInactive}>
                      <Ionicons name={filter.icon} size={17} color="#4A6FA5" />
                      <Text style={styles.filterInactiveText}>
                        {filter.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionTitle}>Tendencias</Text>

          <View style={styles.hashtagsGrid}>
            {trendingHashtags.map((item) => (
              <Pressable
                key={item.tag}
                style={styles.hashtagCard}
                onPress={() => setSearch(item.tag)}
              >
                <View style={styles.hashtagRow}>
                  <Ionicons name="pricetag-outline" size={18} color="#7C3AED" />
                  <Text style={styles.hashtagText}>{item.tag}</Text>
                </View>
                <Text style={styles.hashtagCount}>{item.count} posts</Text>
              </Pressable>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#4A6FA5" size="large" />
              <Text style={styles.loadingText}>Cargando publicaciones...</Text>
            </View>
          ) : filteredPosts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="images-outline" size={42} color="#AAB7C4" />
              <Text style={styles.emptyTitle}>No hay publicaciones todavía</Text>
              <Text style={styles.emptyText}>
                Publica una foto desde la sección de Outfits para verla aquí.
              </Text>
            </View>
          ) : (
            <View style={styles.feed}>{filteredPosts.map(renderPost)}</View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>

              <Pressable onPress={() => setCommentModalVisible(false)}>
                <Ionicons name="close" size={25} color="#1F2A44" />
              </Pressable>
            </View>

            <ScrollView style={styles.commentsList}>
              {(selectedPost?.comments || []).length === 0 ? (
                <View style={styles.noCommentsBox}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={36}
                    color="#AAB7C4"
                  />
                  <Text style={styles.noCommentsText}>
                    Aún no hay comentarios.
                  </Text>
                </View>
              ) : (
                selectedPost?.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {(comment.user?.name || "U").charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.commentBubble}>
                      <Text style={styles.commentUser}>
                        {comment.user?.name || "Usuario"}
                      </Text>
                      <Text style={styles.commentContent}>{comment.content}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.commentInputRow}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Escribe un comentario..."
                placeholderTextColor="#9CA3AF"
                style={styles.commentInput}
              />

              <Pressable
                onPress={handleCreateComment}
                style={styles.sendCommentButton}
              >
                <Ionicons name="send" size={19} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editOverlay}>
          <View style={styles.editCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar publicación</Text>

              <Pressable onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={25} color="#1F2A44" />
              </Pressable>
            </View>

            <Text style={styles.editLabel}>Título</Text>

            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Ej. Outfit casual elegante"
              placeholderTextColor="#9CA3AF"
              style={styles.editInput}
            />

            <Pressable
              onPress={handleSaveEdit}
              disabled={savingEdit}
              style={styles.saveEditButtonWrapper}
            >
              <LinearGradient
                colors={["#4A6FA5", "#8FB8A8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveEditButton}
              >
                {savingEdit ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveEditButtonText}>Guardar cambios</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0FA",
  },

  scrollContent: {
    paddingBottom: 120,
  },

  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 34,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 5,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  searchCard: {
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1F2A44",
  },

  content: {
    paddingHorizontal: 20,
    marginTop: 22,
  },

  filtersRow: {
    paddingBottom: 12,
  },

  filterPressable: {
    marginRight: 10,
  },

  filterActive: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  filterActiveText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 6,
  },

  filterInactive: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: "#FFFFFF",
  },

  filterInactiveText: {
    color: "#4A6FA5",
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 6,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2A44",
    marginTop: 6,
    marginBottom: 14,
  },

  hashtagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  hashtagCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 15,
    marginBottom: 12,
  },

  hashtagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  hashtagText: {
    color: "#5B21B6",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 7,
  },

  hashtagCount: {
    color: "#6B7280",
    fontSize: 13,
  },

  feed: {
    marginTop: 4,
  },

  postCard: {
    height: 430,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginBottom: 28,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },

  postImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },

  postOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  postTopActions: {
    position: "absolute",
    top: 18,
    right: 18,
    flexDirection: "row",
  },

  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  floatingButtonDanger: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  postAuthorRow: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 135,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarSmall: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarLetter: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 22,
  },

  authorName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  postStyle: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    marginTop: 2,
  },

  postBottom: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 20,
  },

  postTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 16,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 7,
  },

  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 30,
    alignItems: "center",
  },

  loadingText: {
    color: "#6B7280",
    marginTop: 10,
  },

  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 30,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#1F2A44",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.50)",
    justifyContent: "flex-end",
  },

  commentSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "78%",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },

  modalHandle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2A44",
  },

  commentsList: {
    maxHeight: 320,
  },

  noCommentsBox: {
    paddingVertical: 32,
    alignItems: "center",
  },

  noCommentsText: {
    color: "#6B7280",
    marginTop: 8,
  },

  commentItem: {
    flexDirection: "row",
    marginBottom: 14,
  },

  commentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#4A6FA5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  commentAvatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  commentBubble: {
    flex: 1,
    backgroundColor: "#EEF3F7",
    borderRadius: 18,
    padding: 12,
  },

  commentUser: {
    color: "#1F2A44",
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 3,
  },

  commentContent: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 18,
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  commentInput: {
    flex: 1,
    backgroundColor: "#EEF3F7",
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#1F2A44",
    marginRight: 10,
  },

  sendCommentButton: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#4A6FA5",
    alignItems: "center",
    justifyContent: "center",
  },

  editOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.50)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  editCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
  },

  editLabel: {
    color: "#4B5563",
    fontWeight: "800",
    marginBottom: 8,
  },

  editInput: {
    backgroundColor: "#EEF3F7",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#1F2A44",
    fontSize: 15,
    marginBottom: 16,
  },

  saveEditButtonWrapper: {
    borderRadius: 999,
    overflow: "hidden",
  },

  saveEditButton: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
  },

  saveEditButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});