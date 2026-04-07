import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import OnboardingHeader from "./OnboardingHeader";
import VisualStyleCard from "./VisualStyleCard";

const styleOptions = [
  {
    id: "casual",
    label: "Casual",
    imageUrl:
      "https://images.unsplash.com/photo-1770364019604-fd4ccecf4076?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBvdXRmaXQlMjB3b21hbiUyMHN0cmVldCUyMHN0eWxlfGVufDF8fHx8MTc3MzM0MTkzOHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "formal",
    label: "Formal",
    imageUrl:
      "https://images.unsplash.com/photo-1767120995544-114f15716cfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBidXNpbmVzcyUyMG91dGZpdCUyMHdvbWFuJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzMzNDE5Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "deportivo",
    label: "Deportivo",
    imageUrl:
      "https://images.unsplash.com/photo-1768929096134-f45af7839e83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHklMjBhdGhsZWlzdXJlJTIwb3V0Zml0JTIwd29tYW4lMjBneW18ZW58MXx8fHwxNzczMzQxOTM5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "elegante",
    label: "Elegante",
    imageUrl:
      "https://images.unsplash.com/photo-1691316089197-1269faeb3af7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZXZlbmluZyUyMGRyZXNzJTIwd29tYW4lMjBmYXNoaW9ufGVufDF8fHx8MTc3MzM0MTk0MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "bohemio",
    label: "Bohemio",
    imageUrl:
      "https://images.unsplash.com/photo-1724128189906-19f339fa8a09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2hlbWlhbiUyMGJvaG8lMjBvdXRmaXQlMjB3b21hbiUyMGZsb3d5fGVufDF8fHx8MTc3MzM0MTk0MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "streetwear",
    label: "Streetwear",
    imageUrl:
      "https://images.unsplash.com/photo-1770182022177-5f35542503ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBvdXRmaXQlMjB3b21hbiUyMHNuZWFrZXJzfGVufDF8fHx8MTc3MzM0MTk0MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "minimalista",
    label: "Minimalista",
    imageUrl:
      "https://images.unsplash.com/photo-1665029511875-a65a6bdbf98f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwb3V0Zml0JTIwd29tYW4lMjBtb25vY2hyb21lJTIwc2ltcGxlfGVufDF8fHx8MTc3MzM0MTk0MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "vintage",
    label: "Vintage",
    imageUrl:
      "https://images.unsplash.com/photo-1731513343223-3b12315c4ffb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwcmV0cm8lMjBvdXRmaXQlMjB3b21hbiUyMGZhc2hpb258ZW58MXx8fHwxNzczMzQxOTQxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

interface Step1StyleProps {
  selectedStyles: string[];
  onUpdate: (styles: string[]) => void;
}

export default function Step1Style({
  selectedStyles,
  onUpdate,
}: Step1StyleProps) {
  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      onUpdate(selectedStyles.filter((s) => s !== styleId));
    } else {
      onUpdate([...selectedStyles, styleId]);
    }
  };

  return (
    <View style={styles.container}>
      <OnboardingHeader
        title="¿Cuál es tu estilo?"
        subtitle="Selecciona todos los que te representen"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {styleOptions.map((style) => (
          <View key={style.id} style={styles.cardWrapper}>
            <VisualStyleCard
              label={style.label}
              imageUrl={style.imageUrl}
              isSelected={selectedStyles.includes(style.id)}
              onPress={() => toggleStyle(style.id)}
            />
          </View>
        ))}
      </ScrollView>
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
    paddingBottom: 12,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 14,
  },
});