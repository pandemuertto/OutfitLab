import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VisualStyleCardProps {
  label: string;
  imageUrl: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function VisualStyleCard({
  label,
  imageUrl,
  isSelected,
  onPress,
}: VisualStyleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        <View style={styles.overlay} />

        {isSelected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        )}

        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 170,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#4A6FA5",
  },
  image: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageRadius: {
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(31,42,68,0.18)",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#4A6FA5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  labelContainer: {
    marginTop: "auto",
    padding: 12,
    zIndex: 2,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});