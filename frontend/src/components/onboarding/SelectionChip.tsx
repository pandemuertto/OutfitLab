import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SelectionChipProps {
  label: string;
  color?: string;
  onRemove: () => void;
}

export default function SelectionChip({
  label,
  color,
  onRemove,
}: SelectionChipProps) {
  return (
    <View style={styles.chip}>
      {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}

      <Text style={styles.label}>{label}</Text>

      <Pressable onPress={onRemove} hitSlop={8} style={styles.removeButton}>
        <Ionicons name="close" size={14} color="#6B7280" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  label: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  removeButton: {
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});