import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface StepCompleteProps {
  onComplete: () => void;
}

export default function StepComplete({ onComplete }: StepCompleteProps) {
  return (
    <View style={styles.container}>
      <View style={styles.confettiContainer} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.confetti,
              {
                backgroundColor: ["#4A6FA5", "#8FB8A8", "#A78BFA", "#CDB4DB"][i % 4],
                left: `${15 + i * 7}%`,
                top: `${18 + (i % 4) * 8}%`,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.checkWrapper}>
        <View style={styles.glow} />
        <LinearGradient
          colors={["#4A6FA5", "#8FB8A8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.checkCircle}
        >
          <Ionicons name="checkmark" size={46} color="#FFFFFF" />
        </LinearGradient>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>
          Perfecto, ya conocemos{"\n"}tu estilo ✨
        </Text>
        <Text style={styles.subtitle}>
          Estamos creando tu experiencia personalizada
        </Text>
      </View>

      <View style={styles.dotsRow}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Pressable onPress={onComplete} style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#4A6FA5", "#8FB8A8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Ir a mi armario</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 480,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    position: "relative",
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  confetti: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 999,
    opacity: 0.9,
  },
  checkWrapper: {
    marginBottom: 36,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: "rgba(74,111,165,0.25)",
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4A6FA5",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  textBlock: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "600",
    color: "#1F2A44",
    textAlign: "center",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: 260,
  },
  dotsRow: {
    flexDirection: "row",
    marginBottom: 42,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#4A6FA5",
    marginHorizontal: 4,
    opacity: 0.7,
  },
  buttonWrapper: {},
  button: {
    height: 52,
    paddingHorizontal: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4A6FA5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});