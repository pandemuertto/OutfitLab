import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import OnboardingHeader from "./OnboardingHeader";

const seasons = [
  {
    id: "primavera",
    label: "Primavera",
    emoji: "🌸",
    colors: ["#B7E4C7", "#A8DADC"] as const,
  },
  {
    id: "verano",
    label: "Verano",
    emoji: "☀️",
    colors: ["#A8DADC", "#CDB4DB"] as const,
  },
  {
    id: "otoño",
    label: "Otoño",
    emoji: "🍂",
    colors: ["#CDB4DB", "#8FB8A8"] as const,
  },
  {
    id: "invierno",
    label: "Invierno",
    emoji: "❄️",
    colors: ["#4A6FA5", "#8FB8A8"] as const,
  },
];

interface Step4SeasonsProps {
  selectedSeasons: string[];
  onUpdate: (seasons: string[]) => void;
}

export default function Step4Seasons({
  selectedSeasons,
  onUpdate,
}: Step4SeasonsProps) {
  const toggleSeason = (seasonId: string) => {
    if (selectedSeasons.includes(seasonId)) {
      onUpdate(selectedSeasons.filter((s) => s !== seasonId));
    } else {
      onUpdate([...selectedSeasons, seasonId]);
    }
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader
        title="¿Cuáles son tus temporadas favoritas?"
        subtitle="Selecciona las estaciones en las que prefieres vestirte"
      />

      <View style={styles.grid}>
        {seasons.map((season) => {
          const isSelected = selectedSeasons.includes(season.id);

          return (
            <Pressable
              key={season.id}
              onPress={() => toggleSeason(season.id)}
              style={styles.cardWrapper}
            >
              <LinearGradient
                colors={season.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.card,
                  isSelected ? styles.cardSelected : styles.cardUnselected,
                ]}
              >
                <Text style={styles.emoji}>{season.emoji}</Text>
                <Text style={styles.label}>{season.label}</Text>

                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  card: {
    minHeight: 165,
    borderRadius: 24,
    padding: 22,
    justifyContent: "space-between",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#4A6FA5",
    shadowColor: "#4A6FA5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  cardUnselected: {
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  emoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "#4A6FA5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4A6FA5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
});