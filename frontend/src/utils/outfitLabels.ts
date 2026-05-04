//frontend/src/utils/outfitLabel.ts
export function formatPieceType(type?: string | null) {
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
    sunglasses: "Lentes",
  };

  return map[type] || type;
}