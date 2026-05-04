// frontend/app/armario-compartido.tsx
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

export default function ArmarioCompartidoScreen() {
  const showComingSoon = (plan?: string) => {
    Alert.alert(
      "Próximamente",
      plan
        ? `${plan} estará disponible en una próxima versión premium de Closi.`
        : "Armario Compartido estará disponible en una próxima versión premium de Closi."
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
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerIcon}>
          <Ionicons name="people-outline" size={42} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Armario Compartido</Text>

        <Text style={styles.subtitle}>
          Una función premium para combinar prendas con personas cercanas
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.mainCard}>
          <View style={styles.badge}>
            <Ionicons name="sparkles-outline" size={16} color="#4A6FA5" />
            <Text style={styles.badgeText}>Próximamente Premium</Text>
          </View>

          <Text style={styles.mainTitle}>
            Comparte tu armario con pareja, familia o roommates
          </Text>

          <Text style={styles.mainDescription}>
            Esta función permitirá crear un armario compartido donde varias
            personas podrán ver prendas disponibles, combinar looks y generar
            outfits en conjunto.
          </Text>

          <View style={styles.previewBox}>
            <View style={styles.previewAvatar}>
              <Ionicons name="person-outline" size={24} color="#FFFFFF" />
            </View>

            <View style={styles.previewAvatarSecond}>
              <Ionicons name="person-outline" size={24} color="#FFFFFF" />
            </View>

            <View style={styles.previewPlus}>
              <Ionicons name="add" size={22} color="#4A6FA5" />
            </View>
          </View>

          <Pressable
            onPress={() => showComingSoon()}
            style={styles.primaryButtonWrapper}
          >
            <LinearGradient
              colors={["#4A6FA5", "#8FB8A8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Ionicons name="lock-closed-outline" size={19} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                Disponible próximamente
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cómo funcionará?</Text>

          <View style={styles.stepsCard}>
            <FeatureRow
              icon="person-add-outline"
              title="Invita usuarios"
              description="Podrás agregar a tu pareja, familiares o personas con quienes compartas espacio."
            />

            <View style={styles.divider} />

            <FeatureRow
              icon="shirt-outline"
              title="Ve prendas compartidas"
              description="Cada integrante podrá elegir qué prendas quiere hacer visibles para el grupo."
            />

            <View style={styles.divider} />

            <FeatureRow
              icon="sparkles-outline"
              title="Genera outfits en conjunto"
              description="Closi podrá recomendar looks usando prendas tuyas y prendas compartidas."
            />

            <View style={styles.divider} />

            <FeatureRow
              icon="shield-checkmark-outline"
              title="Privacidad y permisos"
              description="Cada usuario decidirá qué compartir y con quién compartirlo."
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planes pensados</Text>

          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planIcon}>
                <Ionicons name="heart-outline" size={25} color="#4A6FA5" />
              </View>

              <View style={styles.planTextContainer}>
                <Text style={styles.planTitle}>Closi Couple</Text>
                <Text style={styles.planSubtitle}>
                  Para 2 usuarios
                </Text>
              </View>

              <View style={styles.planPill}>
                <Text style={styles.planPillText}>Premium</Text>
              </View>
            </View>

            <Text style={styles.planDescription}>
              Ideal para parejas o mejores amigos que quieren combinar prendas,
              planear looks y compartir inspiración.
            </Text>

            <Pressable
              onPress={() => showComingSoon("Closi Couple")}
              style={styles.planButton}
            >
              <Text style={styles.planButtonText}>Ver plan</Text>
              <Ionicons name="chevron-forward" size={17} color="#4A6FA5" />
            </Pressable>
          </View>

          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planIcon}>
                <Ionicons name="home-outline" size={25} color="#4A6FA5" />
              </View>

              <View style={styles.planTextContainer}>
                <Text style={styles.planTitle}>Closi Family</Text>
                <Text style={styles.planSubtitle}>
                  Para 3 a 6 usuarios
                </Text>
              </View>

              <View style={styles.planPill}>
                <Text style={styles.planPillText}>Premium</Text>
              </View>
            </View>

            <Text style={styles.planDescription}>
              Pensado para familias o roommates que quieren organizar prendas,
              compartir ropa disponible y crear combinaciones para distintos
              eventos.
            </Text>

            <Pressable
              onPress={() => showComingSoon("Closi Family")}
              style={styles.planButton}
            >
              <Text style={styles.planButtonText}>Ver plan</Text>
              <Ionicons name="chevron-forward" size={17} color="#4A6FA5" />
            </Pressable>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={24} color="#4A6FA5" />

          <View style={styles.noteTextContainer}>
            <Text style={styles.noteTitle}>Función futura del MVP</Text>

            <Text style={styles.noteText}>
              Para esta primera versión, Closi se enfoca en el armario personal,
              generación de outfits, guardado de looks y perfil. Armario
              Compartido queda como parte del modelo de negocio premium.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color="#4A6FA5" />
      </View>

      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3F7",
  },

  scrollContent: {
    paddingBottom: 60,
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 58,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    top: 58,
    left: 20,
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 320,
  },

  content: {
    paddingHorizontal: 24,
    marginTop: -34,
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 24,
    marginBottom: 28,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 6,
  },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74,111,165,0.10)",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: 16,
  },

  badgeText: {
    marginLeft: 6,
    color: "#4A6FA5",
    fontSize: 12,
    fontWeight: "800",
  },

  mainTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#1F2A44",
    lineHeight: 32,
    marginBottom: 12,
  },

  mainDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 22,
  },

  previewBox: {
    height: 130,
    borderRadius: 26,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 22,
    overflow: "hidden",
  },

  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4A6FA5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: -8,
    zIndex: 2,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  previewAvatarSecond: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#8FB8A8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
    zIndex: 1,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  previewPlus: {
    position: "absolute",
    right: 24,
    top: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonWrapper: {
    borderRadius: 999,
    overflow: "hidden",
  },

  primaryButton: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 14,
  },

  stepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  featureRow: {
    flexDirection: "row",
    padding: 18,
  },

  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  featureTextContainer: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 4,
  },

  featureDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginLeft: 82,
  },

  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  planIcon: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  planTextContainer: {
    flex: 1,
  },

  planTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2A44",
  },

  planSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  planPill: {
    backgroundColor: "rgba(167,139,250,0.16)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  planPillText: {
    color: "#7C3AED",
    fontSize: 11,
    fontWeight: "800",
  },

  planDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },

  planButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF3F7",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  planButtonText: {
    color: "#4A6FA5",
    fontSize: 13,
    fontWeight: "800",
    marginRight: 3,
  },

  noteCard: {
    backgroundColor: "rgba(74,111,165,0.10)",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    marginBottom: 20,
  },

  noteTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  noteTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 4,
  },

  noteText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },
});