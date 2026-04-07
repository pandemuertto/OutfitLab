import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import OnboardingHeader from "./OnboardingHeader";

const goals: {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "renovar", label: "Renovar mi estilo", iconName: "sparkles-outline" },
  { id: "organizar", label: "Organizar mi armario", iconName: "folder-open-outline" },
  { id: "sostenible", label: "Ser más sostenible", iconName: "leaf-outline" },
  { id: "ahorrar", label: "Ahorrar dinero", iconName: "cash-outline" },
  { id: "tendencias", label: "Seguir tendencias", iconName: "trending-up-outline" },
  { id: "versatil", label: "Looks más versátiles", iconName: "shuffle-outline" },
];

interface Step5GoalsProps {
  selectedGoals: string[];
  onUpdate: (goals: string[]) => void;
}

export default function Step5Goals({
  selectedGoals,
  onUpdate,
}: Step5GoalsProps) {
  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      onUpdate(selectedGoals.filter((g) => g !== goalId));
    } else {
      onUpdate([...selectedGoals, goalId]);
    }
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader
        title="¿Cuáles son tus objetivos?"
        subtitle="¿Qué quieres lograr con OutfitLab?"
      />

      <View style={styles.grid}>
        {goals.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);

          return (
            <Pressable
              key={goal.id}
              onPress={() => toggleGoal(goal.id)}
              style={[
                styles.card,
                isSelected ? styles.cardSelected : styles.cardUnselected,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  isSelected
                    ? styles.iconContainerSelected
                    : styles.iconContainerUnselected,
                ]}
              >
                <Ionicons
                  name={goal.iconName}
                  size={22}
                  color={isSelected ? "#4A6FA5" : "#9CA3AF"}
                />
              </View>

              <Text style={styles.label}>{goal.label}</Text>

              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
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
  card: {
    position: "relative",
    width: "48%",
    minHeight: 150,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 22,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cardSelected: {
    backgroundColor: "rgba(143,184,168,0.10)",
    borderColor: "#4A6FA5",
    shadowColor: "#4A6FA5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  cardUnselected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F3F4F6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconContainerSelected: {
    backgroundColor: "rgba(74,111,165,0.10)",
  },
  iconContainerUnselected: {
    backgroundColor: "#F9FAFB",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 18,
  },
  checkBadge: {
    position: "absolute",
    top: -6,
    right: -6,
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