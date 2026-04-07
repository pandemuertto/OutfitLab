import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface OnboardingHeaderProps {
  title: string;
  subtitle: string;
}

export default function OnboardingHeader({
  title,
  subtitle,
}: OnboardingHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2A44",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});