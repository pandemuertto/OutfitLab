import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import profileStyles from '../../src/styles/profile';
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../src/contexts/auth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [stats] = useState({ prendas: 0, outfits: 0 });

  console.log('👤 Perfil - usuario actual:', user); // 👈 Ver qué usuario hay

  const handleLogout = async () => {
    console.log('🚪 Iniciando proceso de logout...'); // 👈 Log 1
    
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, cerrar sesión",
          onPress: async () => {
            console.log('✅ Usuario confirmó logout'); // 👈 Log 2
            try {
              console.log('📤 Llamando a logout() del contexto...'); // 👈 Log 3
              await logout();
              console.log('🔄 Logout completado, redirigiendo...'); // 👈 Log 4
              router.replace("/login");
              console.log('🎯 Redirección ejecutada'); // 👈 Log 5
            } catch (error) {
              console.error('❌ Error en logout:', error);
              Alert.alert("Error", "No se pudo cerrar la sesión");
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={profileStyles.container}>
      {/* Header con foto de perfil */}
      <View style={profileStyles.profileImageContainer}>
        <View style={profileStyles.avatarPlaceholder}>
          <Ionicons name="person" size={40} color="#666" />
        </View>
        <TouchableOpacity style={profileStyles.editImageButton}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Información del usuario */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333' }}>
          {user?.name || 'Usuario'}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          {user?.email || 'usuario@example.com'}
        </Text>
      </View>

      {/* Estadísticas */}
      <View style={profileStyles.statsContainer}>
        <View style={profileStyles.statItem}>
          <Text style={profileStyles.statNumber}>{stats.prendas}</Text>
          <Text style={profileStyles.statLabel}>Prendas</Text>
        </View>
        <View style={[profileStyles.statItem, profileStyles.statBorder]}>
          <Text style={profileStyles.statNumber}>{stats.outfits}</Text>
          <Text style={profileStyles.statLabel}>Outfits</Text>
        </View>
      </View>

      {/* Menú de opciones */}
      <View style={profileStyles.menuContainer}>
        <TouchableOpacity style={profileStyles.menuItem}>
          <View style={profileStyles.menuItemContent}>
            <Ionicons name="person-outline" size={24} color="#333" />
            <Text style={profileStyles.menuItemText}>Editar Perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={profileStyles.menuItem}>
          <View style={profileStyles.menuItemContent}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <Text style={profileStyles.menuItemText}>Notificaciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={profileStyles.menuItem}>
          <View style={profileStyles.menuItemContent}>
            <Ionicons name="lock-closed-outline" size={24} color="#333" />
            <Text style={profileStyles.menuItemText}>Privacidad</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={profileStyles.menuItem}>
          <View style={profileStyles.menuItemContent}>
            <Ionicons name="help-circle-outline" size={24} color="#333" />
            <Text style={profileStyles.menuItemText}>Ayuda y Soporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity style={profileStyles.menuItem} onPress={handleLogout}>
          <View style={profileStyles.menuItemContent}>
            <Ionicons name="log-out-outline" size={24} color="#ff4444" />
            <Text style={[profileStyles.menuItemText, { color: "#ff4444" }]}>Cerrar Sesión</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}