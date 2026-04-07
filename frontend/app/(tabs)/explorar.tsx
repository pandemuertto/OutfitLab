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

import React, { useEffect, useMemo, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
      prenda: { id: number; type: string | null; color: string | null };
    }[];
    photos: { id: string; url: string }[];
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
  const [posts, setPosts] = useState<ExplorePost[]>([]);

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ExplorePost | null>(null);
  const [commentText, setCommentText] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const trendingHashtags = [
    { tag: "MinimalChic", count: "2.4k" },
    { tag: "SummerVibes", count: "1.8k" },
    { tag: "StreetStyle", count: "3.2k" },
    { tag: "Vintage", count: "1.5k" },
    { tag: "Elegante", count: "2.1k" },
  ];

  const loadPosts = async (styleFilter: string) => {
    try {
      setLoading(true);

      const query =
        styleFilter && styleFilter !== "Tendencias"
          ? `?style=${encodeURIComponent(styleFilter)}`
          : "";

      const data = await get(`/api/explore/outfits${query}`);
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Error cargando explore:", err);
      Alert.alert("Error", "No se pudieron cargar las publicaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(activeFilter);
  }, [activeFilter]);

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

  const getMainImage = (post: ExplorePost) => {
    if (post.imageUrl) {
      if (post.imageUrl.startsWith("http")) return post.imageUrl;
      return `${API_URL}${post.imageUrl}`;
    }

    if (post.outfit?.photos?.[0]?.url) {
      const url = post.outfit.photos[0].url;
      if (url.startsWith("http")) return url;
      return `${API_URL}${url}`;
    }

    return null;
  };

  const hasLiked = (post: ExplorePost): boolean => {
    if (!user?.id) return false;
    return post.likesList.some((l) => l.userId === user.id);
  };

  const isOwner = (post: ExplorePost): boolean => {
    return !!user?.id && post.userId === user.id;
  };

  const handleToggleLike = async (postItem: ExplorePost) => {
    if (!user?.id) {
      Alert.alert("Inicia sesión", "Necesitas iniciar sesión para dar like.");
      return;
    }

    const liked = hasLiked(postItem);

    try {
      if (liked) {
        await del(`/api/explore/${postItem.id}/like`, { userId: user.id });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postItem.id
              ? {
                  ...p,
                  likes: Math.max(0, p.likes - 1),
                  likesList: p.likesList.filter((l) => l.userId !== user.id),
                }
              : p
          )
        );

        if (selectedPost?.id === postItem.id) {
          setSelectedPost((prev) =>
            prev
              ? {
                  ...prev,
                  likes: Math.max(0, prev.likes - 1),
                  likesList: prev.likesList.filter((l) => l.userId !== user.id),
                }
              : prev
          );
        }
      } else {
        await post(`/api/explore/${postItem.id}/like`, { userId: user.id });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postItem.id
              ? {
                  ...p,
                  likes: p.likes + 1,
                  likesList: [...p.likesList, { userId: user.id! }],
                }
              : p
          )
        );

        if (selectedPost?.id === postItem.id) {
          setSelectedPost((prev) =>
            prev
              ? {
                  ...prev,
                  likes: prev.likes + 1,
                  likesList: [...prev.likesList, { userId: user.id! }],
                }
              : prev
          );
        }
      }
    } catch (err) {
      console.error("Error like/unlike:", err);
      Alert.alert("Error", "No se pudo actualizar el like.");
    }
  };

  const openComments = (post: ExplorePost) => {
    setSelectedPost(post);
    setCommentText("");
    setCommentModalVisible(true);
  };

  const handleSendComment = async () => {
    if (!selectedPost || !user?.id) {
      Alert.alert("Error", "No se pudo enviar el comentario.");
      return;
    }

    if (!commentText.trim()) return;

    try {
      const data = await post(`/api/explore/${selectedPost.id}/comment`, {
        userId: user.id,
        content: commentText.trim(),
      });

      const newComment: ExploreComment = data.comment;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? { ...p, comments: [...p.comments, newComment] }
            : p
        )
      );

      setSelectedPost((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : prev
      );

      setCommentText("");
    } catch (err) {
      console.error("Error enviando comentario:", err);
      Alert.alert("Error", "No se pudo enviar el comentario.");
    }
  };

  const openOwnerOptions = (post: ExplorePost) => {
    if (!isOwner(post)) return;

    Alert.alert("Publicación", "¿Qué quieres hacer?", [
      {
        text: "Editar título",
        onPress: () => {
          setSelectedPost(post);
          setEditTitle(post.title);
          setEditModalVisible(true);
        },
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => handleDeletePost(post),
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleSaveEdit = async () => {
    if (!selectedPost || !user?.id) return;

    const newTitle = editTitle.trim();
    if (!newTitle) {
      Alert.alert("Error", "El título no puede estar vacío.");
      return;
    }

    try {
      const data = await put(`/api/explore/${selectedPost.id}`, {
        userId: user.id,
        title: newTitle,
        style: selectedPost.style,
      });

      const updated = data.post;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id ? { ...p, title: updated.title } : p
        )
      );

      setSelectedPost((prev) =>
        prev ? { ...prev, title: updated.title } : prev
      );

      setEditModalVisible(false);
    } catch (err) {
      console.error("Error al editar publicación:", err);
      Alert.alert("Error", "No se pudo editar la publicación.");
    }
  };

  const handleDeletePost = async (postItem: ExplorePost) => {
    if (!user?.id) return;

    try {
      await del(`/api/explore/${postItem.id}`, { userId: user.id });

      setPosts((prev) => prev.filter((p) => p.id !== postItem.id));

      if (selectedPost?.id === postItem.id) {
        setSelectedPost(null);
        setCommentModalVisible(false);
      }
    } catch (err) {
      console.error("Error eliminando publicación:", err);
      Alert.alert("Error", "No se pudo eliminar la publicación.");
    }
  };

  const renderPostCard = (postItem: ExplorePost) => {
    const liked = hasLiked(postItem);
    const mainImage = getMainImage(postItem);

    return (
      <View key={postItem.id} style={styles.feedCard}>
        {mainImage ? (
          <Image
            source={{ uri: mainImage }}
            style={styles.feedImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.feedImage, styles.feedImagePlaceholder]} />
        )}

        <View style={styles.feedBody}>
          <View style={styles.feedHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedTitle}>{postItem.title}</Text>
              <Text style={styles.feedDescription}>
                {postItem.outfit?.items?.length || 0} prendas ·{" "}
                {postItem.style || "Estilo libre"}
              </Text>
              <Text style={styles.feedAuthor}>
                por {postItem.user?.name || "Usuario"}
              </Text>
            </View>

            {isOwner(postItem) && (
              <Pressable
                style={styles.menuButton}
                onPress={() => openOwnerOptions(postItem)}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={18}
                  color="#6B7280"
                />
              </Pressable>
            )}
          </View>

          {postItem.style && (
            <View style={styles.styleChip}>
              <Ionicons name="flame-outline" size={14} color="#A78BFA" />
              <Text style={styles.styleChipText}>{postItem.style}</Text>
            </View>
          )}

          <View style={styles.feedFooterRow}>
            <Pressable
              style={styles.iconRow}
              onPress={() => handleToggleLike(postItem)}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? "#F97373" : "#4B5563"}
              />
              <Text
                style={[
                  styles.iconText,
                  liked && { color: "#F97373", fontWeight: "600" },
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
                color="#4B5563"
              />
              <Text style={styles.iconText}>{postItem.comments.length}</Text>
            </Pressable>

            <View style={[styles.iconRow, { marginLeft: "auto" }]}>
              <Ionicons
                name="share-social-outline"
                size={20}
                color="#4B5563"
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
                      <Ionicons name="pricetag-outline" size={14} color="#A78BFA" />
                      <Text style={styles.hashtagName}>{hashtag.tag}</Text>
                    </View>
                    <Text style={styles.hashtagCount}>{hashtag.count} posts</Text>
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
                    <View style={styles.commentRow}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                          {item.user?.name?.[0]?.toUpperCase() || "U"}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.commentAuthor}>
                          {item.user?.name || "Usuario"}
                        </Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                      </View>
                    </View>
                  )}
                />

                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Escribe un comentario..."
                    placeholderTextColor="#9CA3AF"
                    value={commentText}
                    onChangeText={setCommentText}
                  />
                  <Pressable
                    style={styles.commentSendButton}
                    onPress={handleSendComment}
                  >
                    <Ionicons name="send" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.modalCloseButton}
                  onPress={() => setCommentModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Cerrar</Text>
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
            <Text style={styles.modalSubtitle}>
              Cambia el título de tu publicación en Explorar.
            </Text>

            <TextInput
              style={styles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título del outfit"
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.editButtonsRow}>
              <Pressable
                style={[styles.editButton, { backgroundColor: "#E5E7EB" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.editButtonText, { color: "#111827" }]}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={[styles.editButton, { backgroundColor: "#A78BFA" }]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.editButtonText}>Guardar</Text>
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
    paddingBottom: 90,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -14,
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
    fontSize: 14,
    color: "#111827",
  },
  tabsRow: {
    paddingBottom: 10,
    marginBottom: 14,
  },
  tabPressable: {
    marginRight: 10,
  },
  tabActive: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
  },
  tabActiveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  tabInactive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
  },
  tabInactiveText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  hashtagsSection: {
    marginBottom: 20,
  },
  hashtagsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2A44",
    marginBottom: 14,
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
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  hashtagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  hashtagName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 6,
  },
  hashtagCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  loadingContainer: {
    paddingTop: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  emptyText: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  feedList: {
    paddingBottom: 10,
  },
  feedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  feedImage: {
    width: "100%",
    height: 260,
    backgroundColor: "#E5E7EB",
  },
  feedImagePlaceholder: {
    backgroundColor: "#E5E7EB",
  },
  feedBody: {
    padding: 16,
  },
  feedHeaderRow: {
    flexDirection: "row",
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  feedDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  feedAuthor: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  menuButton: {
    marginLeft: "auto",
    padding: 4,
  },
  styleChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(167,139,250,0.12)",
  },
  styleChipText: {
    marginLeft: 4,
    color: "#8B5CF6",
    fontSize: 12,
    fontWeight: "600",
  },
  feedFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#4B5563",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  commentsModal: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "white",
    padding: 18,
  },
  editModal: {
    width: "88%",
    borderRadius: 20,
    backgroundColor: "white",
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
    marginTop: 2,
  },
  modalEmptyText: {
    marginTop: 12,
    fontSize: 13,
    color: "#9CA3AF",
  },
  modalCloseButton: {
    marginTop: 12,
    backgroundColor: "#A78BFA",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontWeight: "600",
  },
  commentRow: {
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 6,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  commentText: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#111827",
  },
  commentSendButton: {
    marginLeft: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  editInput: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  editButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
  },
  editButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 8,
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
});