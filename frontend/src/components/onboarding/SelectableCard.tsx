import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SelectableCardProps {
  label: string;
  color?: string;
  variant?: "color" | "text";
  isSelected: boolean;
  onPress: () => void;
}

export default function SelectableCard({
  label,
  color,
  variant = "text",
  isSelected,
  onPress,
}: SelectableCardProps) {
  if (variant === "color") {
    const isWhite = color?.toLowerCase() === "#ffffff";

    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.colorCard,
          isSelected && styles.colorCardSelected,
          isWhite && styles.whiteBorder,
        ]}
      >
        <View
          style={[
            styles.colorCircle,
            { backgroundColor: color || "#E5E7EB" },
            isWhite && styles.whiteBorder,
          ]}
        >
          {isSelected && (
            <Ionicons
              name="checkmark"
              size={16}
              color={isWhite ? "#1F2A44" : "#FFFFFF"}
            />
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.textCard, isSelected && styles.textCardSelected]}
    >
      <Text style={[styles.textLabel, isSelected && styles.textLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  colorCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 18,
  },
  colorCardSelected: {
    backgroundColor: "rgba(74,111,165,0.08)",
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  whiteBorder: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  textCard: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textCardSelected: {
    borderColor: "#4A6FA5",
    backgroundColor: "rgba(74,111,165,0.08)",
  },
  textLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    textAlign: "center",
  },
  textLabelSelected: {
    color: "#4A6FA5",
    fontWeight: "700",
  },
});