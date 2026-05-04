import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function Ayuda() {
  const faqs = [
    {
      q: "¿Cómo subo una prenda?",
      a: "Ve a Armario, toca el botón + y toma una foto o selecciona una imagen de tu galería.",
    },
    {
      q: "¿Cómo genero un outfit?",
      a: "Ve a Outfits, elige ocasión, clima y estilo. Luego toca Generar Outfit Perfecto.",
    },
    {
      q: "¿Por qué no reconoce bien mi ropa?",
      a: "Toma fotos con buena luz, fondo claro y la prenda completa. Evita sombras fuertes o fondos con muchas cosas.",
    },
  ];

  const contactSupport = () => {
    Alert.alert(
      "Soporte",
      "Por ahora puedes reportar problemas directamente con el equipo de OutfitLab."
    );
  };

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
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerIcon}>
          <Ionicons name="help-circle-outline" size={38} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Ayuda y soporte</Text>
        <Text style={styles.subtitle}>
          Encuentra respuestas rápidas sobre OutfitLab
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preguntas frecuentes</Text>

          {faqs.map((item, index) => (
            <View key={item.q}>
              <View style={styles.faqItem}>
                <View style={styles.faqIcon}>
                  <Ionicons name="chatbubble-ellipses-outline" size={21} color="#4A6FA5" />
                </View>

                <View style={styles.faqText}>
                  <Text style={styles.question}>{item.q}</Text>
                  <Text style={styles.answer}>{item.a}</Text>
                </View>
              </View>

              {index !== faqs.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consejos para mejores resultados</Text>

          <View style={styles.tipRow}>
            <Ionicons name="sunny-outline" size={22} color="#8FB8A8" />
            <Text style={styles.tipText}>Usa buena iluminación natural.</Text>
          </View>

          <View style={styles.tipRow}>
            <Ionicons name="scan-outline" size={22} color="#8FB8A8" />
            <Text style={styles.tipText}>
              Procura que la prenda se vea completa.
            </Text>
          </View>

          <View style={styles.tipRow}>
            <Ionicons name="image-outline" size={22} color="#8FB8A8" />
            <Text style={styles.tipText}>
              Usa fondo claro, limpio y sin muchos objetos.
            </Text>
          </View>
        </View>

        <Pressable onPress={contactSupport} style={styles.supportButtonWrapper}>
          <LinearGradient
            colors={["#4A6FA5", "#8FB8A8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.supportButton}
          >
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.supportButtonText}>Contactar soporte</Text>
          </LinearGradient>
        </Pressable>
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
    paddingBottom: 50,
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 42,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    top: 58,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    width: 82,
    height: 82,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    marginTop: 6,
    textAlign: "center",
  },

  content: {
    paddingHorizontal: 24,
    marginTop: -22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 14,
  },

  faqItem: {
    flexDirection: "row",
    paddingVertical: 12,
  },

  faqIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  faqText: {
    flex: 1,
  },

  question: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 4,
  },

  answer: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
  },

  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  tipText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
    lineHeight: 20,
  },

  supportButtonWrapper: {
    borderRadius: 999,
    overflow: "hidden",
  },

  supportButton: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  supportButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },
});