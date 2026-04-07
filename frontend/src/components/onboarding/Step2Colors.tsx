import React from "react";
import { StyleSheet, View, Text } from "react-native";
import OnboardingHeader from "./OnboardingHeader";
import SelectableCard from "./SelectableCard";
import SelectionChip from "./SelectionChip";

const colorOptions = [
  { name: "Negro", hex: "#000000" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Gris", hex: "#9CA3AF" },
  { name: "Beige", hex: "#D4C5B9" },
  { name: "Rosa", hex: "#F8BBD0" },
  { name: "Rojo", hex: "#EF4444" },
  { name: "Naranja", hex: "#F97316" },
  { name: "Amarillo", hex: "#FBBF24" },
  { name: "Verde", hex: "#4CAF50" },
  { name: "Azul", hex: "#3B82F6" },
  { name: "Morado", hex: "#A855F7" },
  { name: "Café", hex: "#92400E" },
];

interface Step2ColorsProps {
  selectedColors: Array<{ name: string; hex: string }>;
  onUpdate: (colors: Array<{ name: string; hex: string }>) => void;
}

export default function Step2Colors({
  selectedColors,
  onUpdate,
}: Step2ColorsProps) {
  const toggleColor = (color: { name: string; hex: string }) => {
    const exists = selectedColors.find((c) => c.hex === color.hex);

    if (exists) {
      onUpdate(selectedColors.filter((c) => c.hex !== color.hex));
    } else {
      onUpdate([...selectedColors, color]);
    }
  };

  const removeColor = (hex: string) => {
    onUpdate(selectedColors.filter((c) => c.hex !== hex));
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader
        title="¿Qué colores te encantan?"
        subtitle="Elige los colores que más usas"
      />

      <View style={styles.grid}>
        {colorOptions.map((color) => (
          <View key={color.hex} style={styles.colorItem}>
            <SelectableCard
              label=""
              color={color.hex}
              variant="color"
              isSelected={selectedColors.some((c) => c.hex === color.hex)}
              onPress={() => toggleColor(color)}
            />
          </View>
        ))}
      </View>

      {selectedColors.length > 0 && (
        <View style={styles.selectionSection}>
          <Text style={styles.selectionTitle}>Tu selección actual</Text>

          <View style={styles.chipsContainer}>
            {selectedColors.map((color) => (
              <SelectionChip
                key={color.hex}
                label={color.name}
                color={color.hex}
                onRemove={() => removeColor(color.hex)}
              />
            ))}
          </View>
        </View>
      )}
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
    marginBottom: 24,
  },
  colorItem: {
    width: "22%",
    marginBottom: 14,
  },
  selectionSection: {
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  selectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});