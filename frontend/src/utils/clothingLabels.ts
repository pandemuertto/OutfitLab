//frontend/src/utils/clothingLabels.ts
export function formatClothingType(type?: string | null) {
  if (!type) return "Prenda";

  const map: Record<string, string> = {
    top: "Top",
    shirt: "Camisa",
    blouse: "Blusa",
    "t-shirt": "Playera",
    sweater: "Suéter",
    hoodie: "Sudadera",
    skirt: "Falda",
    trousers: "Pantalón",
    pants: "Pantalón",
    jeans: "Jeans",
    shorts: "Short",
    dress: "Vestido",
    shoe: "Zapatos",
    coat: "Abrigo",
    jacket: "Chaqueta",
    blazer: "Blazer",
    cardigan: "Cárdigan",
    outerwear: "Abrigo",
    bag: "Bolso",
    belt: "Cinturón",
    hat: "Sombrero",
    scarf: "Bufanda",
    glasses: "Lentes",
  };

  return map[type] || type;
}

export function formatCategoryLabel(category?: string | null) {
  if (!category || category === "other") return "Otros";

  const map: Record<string, string> = {
    top: "Blusas",
    bottom: "Pantalones",
    dress: "Vestidos",
    outerwear: "Abrigos",
    shoes: "Zapatos",
    accessory: "Accesorios",
  };

  return map[category] || "Otros";
}