import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VisualOccasionCardProps {
  label: string;
  imageUrl: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onPress: () => void;
}

export default function VisualOccasionCard({
  label,
  imageUrl,
  iconName,
  isSelected,
  onPress,
}: VisualOccasionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, isSelected && styles.selectedCard]}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        <View style={styles.overlay} />

        <View style={styles.content}>
          <View style={styles.leftContent}>
            <View style={styles.iconBadge}>
              <Ionicons name={iconName} size={18} color="#FFFFFF" />
            </View>

            <Text style={styles.label}>{label}</Text>
          </View>

          {isSelected && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 92,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#E5E7EB",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#4A6FA5",
  },
  image: {
    flex: 1,
    justifyContent: "center",
  },
  imageRadius: {
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(31,42,68,0.28)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#4A6FA5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});