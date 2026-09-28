export type CategoryId = "pain" | "malaria" | "chronic" | "cold" | "vitamins" | "baby";

export type Category = { id: CategoryId; name: string };

export type Product = {
  id: number;
  name: string;
  category: CategoryId;
  price: number;
  rx: boolean;
  blurb: string;
};

export type Pharmacy = {
  id: string;
  name: string;
  area: string;
  distance: string;
  hours: string;
  lat: number;
  lng: number;
};

export type OrderItem = { id: number; qty: number };

export type Order = {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Delivered" | "Preparing";
  kind: "delivery" | "pickup";
  method: string;
};

export const DELIVERY_FEE = 25;

export const CATEGORIES: Category[] = [
  { id: "pain", name: "Pain relief" },
  { id: "malaria", name: "Malaria treatment" },
  { id: "chronic", name: "Chronic care" },
  { id: "cold", name: "Cold & flu" },
  { id: "vitamins", name: "Vitamins & supplements" },
  { id: "baby", name: "Baby & mother care" },
];

export const PRODUCTS: Product[] = [
  { id: 1, name: "Panadol Extra", category: "pain", price: 25, rx: false, blurb: "Paracetamol 500mg tablets for pain and fever, 20 tablets." },
  { id: 2, name: "Diclofenac Gel", category: "pain", price: 32, rx: false, blurb: "Topical gel for muscle and joint pain, 50g tube." },
  { id: 3, name: "Coartem 20/120mg", category: "malaria", price: 55, rx: false, blurb: "Artemether/lumefantrine, 24-tablet course for adults." },
  { id: 4, name: "Duo-Cotecxin", category: "malaria", price: 68, rx: true, blurb: "Dihydroartemisinin/piperaquine, prescription antimalarial course." },
  { id: 5, name: "Metformin 500mg", category: "chronic", price: 35, rx: true, blurb: "Blood sugar control tablets, 60-tablet pack." },
  { id: 6, name: "Amlodipine 5mg", category: "chronic", price: 38, rx: true, blurb: "Blood pressure tablets, 30-tablet pack." },
  { id: 7, name: "Insulin Mixtard 30/70", category: "chronic", price: 120, rx: true, blurb: "Injectable insulin, 10ml vial. Keep refrigerated after opening." },
  { id: 8, name: "Piriton Tablets", category: "cold", price: 20, rx: false, blurb: "Chlorphenamine for allergy and cold symptoms, 30 tablets." },
  { id: 9, name: "Broncho Cough Syrup", category: "cold", price: 27, rx: false, blurb: "Soothing syrup for dry and chesty cough, 100ml." },
  { id: 10, name: "Vitamin C 1000mg", category: "vitamins", price: 30, rx: false, blurb: "Immune support effervescent tablets, 20-tablet tube." },
  { id: 11, name: "Multivitamin Syrup", category: "vitamins", price: 33, rx: false, blurb: "Daily multivitamin syrup for adults, 200ml." },
  { id: 12, name: "ORS + Zinc Sachets", category: "baby", price: 22, rx: false, blurb: "Oral rehydration salts with zinc for children, pack of 10." },
  { id: 13, name: "Baby Paracetamol Syrup", category: "baby", price: 28, rx: false, blurb: "Infant fever and pain relief syrup, 100ml." },
];

export const PHARMACIES: Pharmacy[] = [
  { id: "p1", name: "Kabulonga Community Pharmacy", area: "Kabulonga", distance: "1.2 km", hours: "Open until 20:00", lat: -15.418, lng: 28.33 },
  { id: "p2", name: "Cedar Health Pharmacy", area: "Woodlands", distance: "2.4 km", hours: "Open until 21:00", lat: -15.43, lng: 28.321 },
  { id: "p3", name: "Riverside Pharmacy", area: "Rhodes Park", distance: "3.1 km", hours: "Open 24 hours", lat: -15.409, lng: 28.32 },
  { id: "p4", name: "Northgate Pharmacy", area: "Chelstone", distance: "4.6 km", hours: "Open until 19:00", lat: -15.385, lng: 28.38 },
  { id: "p5", name: "Manda Hill Pharmacy", area: "Manda Hill", distance: "5.0 km", hours: "Open until 20:00", lat: -15.399, lng: 28.319 },
];

export const ORDERS_SEED: Order[] = [
  { id: "UM-10234", date: "Jul 29, 2026", items: [{ id: 5, qty: 2 }, { id: 6, qty: 1 }], total: 113, status: "Delivered", kind: "delivery", method: "Home delivery" },
  { id: "UM-10198", date: "Jun 21, 2026", items: [{ id: 1, qty: 1 }, { id: 12, qty: 2 }], total: 69, status: "Delivered", kind: "pickup", method: "Pickup at Cedar Health Pharmacy" },
];

/**
 * Photos placed in the design (see project/.image-slots.state.json).
 * `position` reproduces the crop the designer framed in each slot.
 */
const PHOTOS: Record<string, { src: string; position: string }> = {
  "hero-photo": { src: "/images/hero-photo.webp", position: "50% 100%" },
  "pharmacy-map": { src: "/images/pharmacy-map.webp", position: "50% 31%" },
  "product-1": { src: "/images/product-1.webp", position: "50% 13%" },
  "product-2": { src: "/images/product-2.webp", position: "50% 17%" },
  "product-3": { src: "/images/product-3.webp", position: "50% 37%" },
  "product-4": { src: "/images/product-4.webp", position: "50% 28%" },
  "product-5": { src: "/images/product-5.webp", position: "50% 30%" },
  "product-6": { src: "/images/product-6.webp", position: "50% 50%" },
};

export function photo(id: string) {
  return PHOTOS[id];
}

export function fmtK(n: number) {
  return "K" + n.toFixed(2);
}

export function findProduct(id: number) {
  return PRODUCTS.find((p) => p.id === id);
}

export function catName(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)?.name ?? "";
}

export function isCategoryId(v: string | null): v is CategoryId {
  return !!v && CATEGORIES.some((c) => c.id === v);
}
