import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import OnboardingHeader from "./OnboardingHeader";
import VisualOccasionCard from "./VisualOccasionCard";
import { Ionicons } from "@expo/vector-icons";

const occasions: {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  imageUrl: string;
}[] = [
  {
    id: "trabajo",
    label: "Trabajo",
    icon: "briefcase-outline",
    imageUrl:
      "https://images.unsplash.com/photo-1736939666660-d4c776e0532c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrJTIwb2ZmaWNlJTIwb3V0Zml0JTIwd29tYW4lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMzQxOTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "casual",
    label: "Casual Diario",
    icon: "cafe-outline",
    imageUrl:
      "https://images.unsplash.com/photo-1595059854048-5762c544c0f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBkYWlseSUyMG91dGZpdCUyMHdvbWFuJTIwY29tZm9ydGFibGV8ZW58MXx8fHwxNzczMzQxOTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "fiestas",
    label: "Fiestas",
    icon: "sparkles-outline",
    imageUrl:
      "https://images.unsplash.com/photo-1766193231555-519bba3dc8db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0eSUyMG91dGZpdCUyMHdvbWFuJTIwbmlnaHQlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NzMzNDE5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "deportes",
    label: "Deportes",
    icon: "barbell-outline",
    imageUrl:
      "https://images.unsplash.com/photo-1768929096150-9a76dc1d6560?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBzcG9ydHMlMjBvdXRmaXQlMjB3b21hbiUyMGFjdGl2ZXxlbnwxfHx8fDE3NzMzNDE5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "citas",
    label: "Citas",
    icon: "heart-outline",
    imageUrl:
      "https://images.unsplash.com/photo-1763100157211-555543c6f597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRlJTIwb3V0Zml0JTIwd29tYW4lMjByb21hbnRpYyUyMGRpbm5lcnxlbnwxfHx8fDE3NzMzNDE5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "formal",
    label: "Eventos Formales",
    icon: "diamond-outline",
    imageUrl:
      "https://images.unsplash.com/photo-1661332506620-6755cd6a7489?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBldmVudCUyMG91dGZpdCUyMHdvbWFuJTIwZ2FsYXxlbnwxfHx8fDE3NzMzNDE5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

interface Step3OccasionsProps {
  selectedOccasions: string[];
  onUpdate: (occasions: string[]) => void;
}

export default function Step3Occasions({
  selectedOccasions,
  onUpdate,
}: Step3OccasionsProps) {
  const toggleOccasion = (occasionId: string) => {
    if (selectedOccasions.includes(occasionId)) {
      onUpdate(selectedOccasions.filter((o) => o !== occasionId));
    } else {
      onUpdate([...selectedOccasions, occasionId]);
    }
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader
        title="¿Para qué ocasiones vistes?"
        subtitle="Selecciona las situaciones más comunes"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {occasions.map((occasion) => (
          <VisualOccasionCard
            key={occasion.id}
            label={occasion.label}
            imageUrl={occasion.imageUrl}
            iconName={occasion.icon}
            isSelected={selectedOccasions.includes(occasion.id)}
            onPress={() => toggleOccasion(occasion.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 12,
  },
});