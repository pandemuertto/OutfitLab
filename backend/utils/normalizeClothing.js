// backend/utils/normalizeClothing.js
function normalizeClothingLabel(label = "") {
  const value = String(label || "").toLowerCase().trim();

  const aliases = {
    outwear: "outerwear",
    outerwear: "outerwear",
    coat: "coat",
    jacket: "jacket",
    blazer: "blazer",
    cardigan: "cardigan",
    trench: "coat",
    parka: "coat",

    top: "top",
    shirt: "shirt",
    blouse: "blouse",
    tshirt: "t-shirt",
    "t-shirt": "t-shirt",
    tee: "t-shirt",
    sweater: "sweater",
    hoodie: "hoodie",

    skirt: "skirt",
    trousers: "trousers",
    pants: "pants",
    jeans: "jeans",
    shorts: "shorts",
    leggings: "pants",

    dress: "dress",

    shoe: "shoe",
    shoes: "shoe",
    sneaker: "shoe",
    sneakers: "shoe",
    boot: "shoe",
    boots: "shoe",
    heel: "shoe",
    heels: "shoe",
    sandal: "shoe",
    sandals: "shoe",

    bag: "bag",
    handbag: "bag",
    belt: "belt",
    hat: "hat",
    scarf: "scarf",
    glasses: "glasses",
    sunglasses: "glasses",
  };

  const normalizedValue = aliases[value] || value;

  let type = normalizedValue;
  let category = "other";

  if (
    ["top", "shirt", "blouse", "t-shirt", "sweater", "hoodie"].includes(
      normalizedValue
    )
  ) {
    category = "top";
  } else if (
    ["skirt", "trousers", "pants", "jeans", "shorts"].includes(normalizedValue)
  ) {
    category = "bottom";
  } else if (["dress"].includes(normalizedValue)) {
    category = "dress";
  } else if (["shoe"].includes(normalizedValue)) {
    category = "shoes";
  } else if (
    ["coat", "jacket", "blazer", "cardigan", "outerwear"].includes(normalizedValue)
  ) {
    category = "outerwear";
  } else if (
    ["bag", "belt", "hat", "scarf", "glasses"].includes(normalizedValue)
  ) {
    category = "accessory";
  }

  return { type, category };
}

module.exports = { normalizeClothingLabel };