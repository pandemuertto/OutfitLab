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
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

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
  outfit: {
    id: string;
    items: {
      prenda: {
        id: number;
        type: string | null;
        color: string | null;
      };
    }[];
    photos: {
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

      return (
        title.includes(term) ||
        author.includes(term) ||
        style.includes(term)
      );
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

  const openComments = (postItem: ExplorePost) => {
    setSelectedPost(postItem);
    setCommentText("");
    setCommentModalVisible(true);
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

  const handleToggleLike = async (postItem: ExplorePost) => {
    if (!user?.id) {
      Alert.alert("Inicia sesión", "Necesitas iniciar sesión para dar like.");
      return;
    }

    const liked = hasLiked(postItem);

    try {
      if (liked) {
        await del(`/api/explore/${postItem.id}/like`, {
          userId: user.id,
        });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postItem.id
              ? {
                  ...p,
                  likes: Math.max(0, p.likes - 1),
                  likesList: p.likesList.filter(
                    (l) => String(l.userId) !== String(user.id)
                  ),
                }
              : p
          )
        );

        setSelectedPost((prev) =>
          prev?.id === postItem.id
            ? {
                ...prev,
                likes: Math.max(0, prev.likes - 1),
                likesList: prev.likesList.filter(
                  (l) => String(l.userId) !== String(user.id)
                ),
              }
            : prev
        );
      } else {
        await post(`/api/explore/${postItem.id}/like`, {
          userId: user.id,
        });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postItem.id
              ? {
                  ...p,
                  likes: p.likes + 1,
                  likesList: [...p.likesList, { userId: String(user.id) }],
                }
              : p
          )
        );

        setSelectedPost((prev) =>
          prev?.id === postItem.id
            ? {
                ...prev,
                likes: prev.likes + 1,
                likesList: [...prev.likesList, { userId: String(user.id) }],
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      Alert.alert("Error", "No se pudo actualizar el like.");
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !user?.id) {
      Alert.alert("Error", "Debes iniciar sesión.");
      return;
    }

    if (!commentText.trim()) {
      Alert.alert("Comentario vacío", "Escribe algo antes de comentar.");
      return;
    }

    try {
      const data = await post(`/api/explore/${selectedPost.id}/comment`, {
        userId: user.id,
        content: commentText.trim(),
      });

      const newComment = data?.comment;

      if (newComment) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === selectedPost.id
              ? {
                  ...p,
                  comments: [...p.comments, newComment],
                }
              : p
          )
        );

        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                comments: [...prev.comments, newComment],
              }
            : prev
        );
      }

      setCommentText("");
    } catch (err) {
      console.error("Error agregando comentario:", err);
      Alert.alert("Error", "No se pudo agregar el comentario.");
    }
  };

  const handleEditPost = async () => {
    if (!selectedPost) return;

    if (!user?.id) {
      Alert.alert("Error", "Debes iniciar sesión.");
      return;
    }

    if (!isOwner(selectedPost)) {
      Alert.alert(
        "No autorizado",
        "Solo puedes editar tus propias publicaciones."
      );
      return;
    }

    if (!editTitle.trim()) {
      Alert.alert("Título vacío", "Escribe un título válido.");
      return;
    }

    try {
      setSavingEdit(true);

      const data = await put(`/api/explore/${selectedPost.id}`, {
        userId: user.id,
        title: editTitle.trim(),
      });

      const updatedPost = data?.post
        ? normalizePost(data.post)
        : {
            ...selectedPost,
            title: editTitle.trim(),
          };

      setPosts((prev) =>
        prev.map((p) => (p.id === selectedPost.id ? updatedPost : p))
      );

      setSelectedPost(updatedPost);
      setEditModalVisible(false);
    } catch (err: any) {
      console.error("Error editando publicación:", err);

      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePost = async (postItem: ExplorePost) => {
    if (!user?.id) {
      Alert.alert("Error", "Debes iniciar sesión.");
      return;
    }

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
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingPostId(postItem.id);

              await del(`/api/explore/${postItem.id}`, {
                userId: user.id,
              });

              setPosts((prev) => prev.filter((p) => p.id !== postItem.id));

              if (selectedPost?.id === postItem.id) {
                setSelectedPost(null);
                setCommentModalVisible(false);
                setEditModalVisible(false);
              }
            } catch (err: any) {
              console.error("Error eliminando publicación:", err);

              Alert.alert("Error", getErrorMessage(err));
            } finally {
              setDeletingPostId(null);
            }
          },
        },
      ]
    );
  };

  const renderPostCard = (postItem: ExplorePost) => {
    const imageUri = getMainImage(postItem);
    const liked = hasLiked(postItem);
    const owner = isOwner(postItem);
    const isDeleting = deletingPostId === postItem.id;

    return (
      <View key={postItem.id} style={styles.postCard}>
        <Image source={{ uri: imageUri }} style={styles.postImage} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.72)"]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 0, y: 1 }}
          style={styles.postOverlay}
        />

        <View style={styles.postHeaderActions}>
          {owner && (
            <>
              <Pressable
                style={styles.topIconButton}
                onPress={() => openEditModal(postItem)}
                disabled={isDeleting}
              >
                <Ionicons name="create-outline" size={18} color="#111827" />
              </Pressable>

              <Pressable
                style={styles.topIconButton}
                onPress={() => handleDeletePost(postItem)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                )}
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.postFooter}>
          <View style={styles.userRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(postItem.user?.name || "U").charAt(0).toUpperCase()}
              </Text>
            </View>

            <View>
              <Text style={styles.userName}>
                {postItem.user?.name || "Usuario"}
              </Text>

              {postItem.style ? (
                <Text style={styles.postStyle}>{postItem.style}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.postTitle}>{postItem.title}</Text>

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.iconRow}
              onPress={() => handleToggleLike(postItem)}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? "#EC4899" : "#FFFFFF"}
              />

              <Text
                style={[
                  styles.iconText,
                  liked && {
                    color: "#EC4899",
                    fontWeight: "700",
                  },
                ]}
              >
                {postItem.likes}
              </Text>
            </Pressable>

            <Pressable
              style={styles.iconRow}
              onPress={() => openComments(postItem)}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.iconText}>{postItem.comments.length}</Text>
            </Pressable>

            <View style={[styles.iconRow, { marginLeft: "auto" }]}>
              <Ionicons
                name="share-social-outline"
                size={20}
                color="#FFFFFF"
              />
            </View>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <LinearGradient
          colors={["#A78BFA", "#CDB4DB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Explorar</Text>
          <Text style={styles.headerSubtitle}>
            Descubre inspiración de moda
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
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar estilos, usuarios, tendencias..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {FILTERS.map((tab) => {
              const isActive = activeFilter === tab.id;

              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveFilter(tab.id)}
                  style={styles.tabPressable}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={["#A78BFA", "#CDB4DB"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tabActive}
                    >
                      <Ionicons name={tab.icon} size={16} color="#FFFFFF" />
                      <Text style={styles.tabActiveText}>{tab.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.tabInactive}>
                      <Ionicons name={tab.icon} size={16} color="#6B7280" />
                      <Text style={styles.tabInactiveText}>{tab.label}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {activeFilter === "Tendencias" && (
            <View style={styles.hashtagsSection}>
              <Text style={styles.hashtagsTitle}>Hashtags populares</Text>

              <View style={styles.hashtagsGrid}>
                {trendingHashtags.map((hashtag) => (
                  <View key={hashtag.tag} style={styles.hashtagCard}>
                    <View style={styles.hashtagRow}>
                      <Ionicons
                        name="pricetag-outline"
                        size={14}
                        color="#A78BFA"
                      />

                      <Text style={styles.hashtagName}>{hashtag.tag}</Text>
                    </View>

                    <Text style={styles.hashtagCount}>
                      {hashtag.count} posts
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>Cargando tendencias...</Text>
            </View>
          ) : filteredPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="sparkles-outline" size={46} color="#9CA3AF" />

              <Text style={styles.emptyTitle}>Sin publicaciones</Text>

              <Text style={styles.emptyText}>
                Aún no hay outfits para este filtro. ¡Sé la primera en publicar!
              </Text>
            </View>
          ) : (
            <View style={styles.feedList}>
              {filteredPosts.map((postItem) => renderPostCard(postItem))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={commentModalVisible && !!selectedPost}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentsModal}>
            {selectedPost && (
              <>
                <Text style={styles.modalTitle}>Comentarios</Text>

                <Text style={styles.modalSubtitle}>{selectedPost.title}</Text>

                <FlatList
                  style={{ marginTop: 10, maxHeight: 280 }}
                  data={selectedPost.comments}
                  keyExtractor={(c) => c.id}
                  ListEmptyComponent={
                    <Text style={styles.modalEmptyText}>
                      Aún no hay comentarios. ¡Escribe el primero!
                    </Text>
                  }
                  renderItem={({ item }) => (
                    <View style={styles.commentCard}>
                      <Text style={styles.commentAuthor}>
                        {item.user?.name || "Usuario"}
                      </Text>

                      <Text style={styles.commentText}>{item.content}</Text>
                    </View>
                  )}
                />

                <View style={styles.commentInputRow}>
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Escribe un comentario..."
                    placeholderTextColor="#9CA3AF"
                    style={styles.commentInput}
                  />

                  <Pressable
                    style={styles.commentSendButton}
                    onPress={handleAddComment}
                  >
                    <Ionicons name="send" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.closeModalButton}
                  onPress={() => setCommentModalVisible(false)}
                >
                  <Text style={styles.closeModalButtonText}>Cerrar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible && !!selectedPost}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.modalTitle}>Editar publicación</Text>

            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título de la publicación"
              placeholderTextColor="#9CA3AF"
              style={styles.editInput}
            />

            <View style={styles.editButtonsRow}>
              <Pressable
                style={[styles.editButton, { backgroundColor: "#E5E7EB" }]}
                onPress={() => setEditModalVisible(false)}
                disabled={savingEdit}
              >
                <Text style={[styles.editButtonText, { color: "#111827" }]}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={[styles.editButton, { backgroundColor: "#8B5CF6" }]}
                onPress={handleEditPost}
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editButtonText}>Guardar</Text>
                )}
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
    backgroundColor: "#F6F2FB",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: 68,
    paddingHorizontal: 24,
    paddingBottom: 34,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -12,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  tabsRow: {
    paddingBottom: 6,
    paddingRight: 12,
  },
  tabPressable: {
    marginRight: 10,
  },
  tabActive: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabActiveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  tabInactive: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabInactiveText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
  },
  hashtagsSection: {
    marginTop: 16,
    marginBottom: 18,
  },
  hashtagsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D1B69",
    marginBottom: 12,
  },
  hashtagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  hashtagCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  hashtagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  hashtagName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4C1D95",
  },
  hashtagCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  feedList: {
    marginTop: 6,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  postImage: {
    width: "100%",
    height: 420,
    backgroundColor: "#E5E7EB",
  },
  postOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  postHeaderActions: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    gap: 8,
  },
  topIconButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  postFooter: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  postStyle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    marginTop: 2,
  },
  postTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    marginLeft: 6,
    color: "#FFFFFF",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  commentsModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    maxHeight: "80%",
  },
  editModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  modalEmptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 18,
  },
  commentCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 10,
    color: "#111827",
  },
  commentSendButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeModalButton: {
    marginTop: 14,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  editInput: {
    marginTop: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#111827",
  },
  editButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  editButton: {
    minWidth: 96,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});