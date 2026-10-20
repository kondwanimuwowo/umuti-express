/**
 * Seeds the catalogue that previously lived as consts in src/lib/data.ts,
 * plus a demo customer and pharmacist login.
 *
 *   npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Role } from "../src/generated/prisma";

// Run under bare tsx, so load the env files ourselves (.env.local wins).
for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile?.(file);
  } catch {
    // Missing file; the other one may carry the values.
  }
}

// Seeding goes over the direct connection, not the pooler.
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL (or DATABASE_URL) before seeding.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const k = (kwacha: number) => Math.round(kwacha * 100);

const CATEGORIES = [
  { slug: "pain", name: "Pain relief", sortOrder: 1 },
  { slug: "malaria", name: "Malaria treatment", sortOrder: 2 },
  { slug: "chronic", name: "Chronic care", sortOrder: 3 },
  { slug: "cold", name: "Cold & flu", sortOrder: 4 },
  { slug: "vitamins", name: "Vitamins & supplements", sortOrder: 5 },
  { slug: "baby", name: "Baby & mother care", sortOrder: 6 },
];

// Only products whose photo actually shows that product; the rest use the placeholder frame.
const PHOTOS: Record<number, { src: string; position: string }> = {
  1: { src: "/images/product-1.webp", position: "50% 13%" },
};

const PRODUCTS = [
  { id: 1, name: "Panadol Extra", categorySlug: "pain", priceNgwee: k(25), rx: false, genericName: "Paracetamol", aliases: ["Panado", "Panadol"], strength: "500mg", form: "Tablet", packSize: "20 tablets", blurb: "Paracetamol 500mg tablets for pain and fever, 20 tablets." },
  { id: 2, name: "Diclofenac Gel", categorySlug: "pain", priceNgwee: k(32), rx: false, genericName: "Diclofenac", aliases: ["Voltaren"], form: "Gel", packSize: "50g tube", blurb: "Topical gel for muscle and joint pain, 50g tube." },
  { id: 3, name: "Coartem 20/120mg", categorySlug: "malaria", priceNgwee: k(55), rx: false, genericName: "Artemether/Lumefantrine", aliases: ["Co-Artem"], strength: "20/120mg", form: "Tablet", packSize: "24 tablets", blurb: "Artemether/lumefantrine, 24-tablet course for adults." },
  { id: 4, name: "Duo-Cotecxin", categorySlug: "malaria", priceNgwee: k(68), rx: true, genericName: "Dihydroartemisinin/Piperaquine", aliases: ["DHA-PQP"], form: "Tablet", blurb: "Dihydroartemisinin/piperaquine, prescription antimalarial course." },
  { id: 5, name: "Metformin 500mg", categorySlug: "chronic", priceNgwee: k(35), rx: true, genericName: "Metformin", aliases: ["Glucophage"], strength: "500mg", form: "Tablet", packSize: "60 tablets", blurb: "Blood sugar control tablets, 60-tablet pack." },
  { id: 6, name: "Amlodipine 5mg", categorySlug: "chronic", priceNgwee: k(38), rx: true, genericName: "Amlodipine", aliases: ["Norvasc"], strength: "5mg", form: "Tablet", packSize: "30 tablets", blurb: "Blood pressure tablets, 30-tablet pack." },
  { id: 7, name: "Insulin Mixtard 30/70", categorySlug: "chronic", priceNgwee: k(120), rx: true, genericName: "Insulin (human, biphasic)", aliases: ["Mixtard", "Insulin"], form: "Injection", packSize: "10ml vial", blurb: "Injectable insulin, 10ml vial. Keep refrigerated after opening." },
  { id: 8, name: "Piriton Tablets", categorySlug: "cold", priceNgwee: k(20), rx: false, genericName: "Chlorphenamine", aliases: ["Chlorpheniramine", "Piriton"], form: "Tablet", packSize: "30 tablets", blurb: "Chlorphenamine for allergy and cold symptoms, 30 tablets." },
  { id: 9, name: "Broncho Cough Syrup", categorySlug: "cold", priceNgwee: k(27), rx: false, form: "Syrup", packSize: "100ml", blurb: "Soothing syrup for dry and chesty cough, 100ml." },
  { id: 10, name: "Vitamin C 1000mg", categorySlug: "vitamins", priceNgwee: k(30), rx: false, genericName: "Ascorbic acid", aliases: ["Vitamin C"], strength: "1000mg", form: "Effervescent tablet", packSize: "20 tablets", blurb: "Immune support effervescent tablets, 20-tablet tube." },
  { id: 11, name: "Multivitamin Syrup", categorySlug: "vitamins", priceNgwee: k(33), rx: false, genericName: "Multivitamin", form: "Syrup", packSize: "200ml", blurb: "Daily multivitamin syrup for adults, 200ml." },
  { id: 12, name: "ORS + Zinc Sachets", categorySlug: "baby", priceNgwee: k(22), rx: false, genericName: "Oral rehydration salts + Zinc", aliases: ["ORS"], form: "Sachet", packSize: "10 sachets", blurb: "Oral rehydration salts with zinc for children, pack of 10." },
  { id: 13, name: "Baby Paracetamol Syrup", categorySlug: "baby", priceNgwee: k(28), rx: false, genericName: "Paracetamol", aliases: ["Panado"], form: "Syrup", packSize: "100ml", blurb: "Infant fever and pain relief syrup, 100ml." },
];

const PHARMACIES = [
  { id: "p1", name: "Kabulonga Community Pharmacy", area: "Kabulonga", hours: "Open until 20:00", lat: -15.418, lng: 28.33 },
  { id: "p2", name: "Cedar Health Pharmacy", area: "Woodlands", hours: "Open until 21:00", lat: -15.43, lng: 28.321 },
  { id: "p3", name: "Riverside Pharmacy", area: "Rhodes Park", hours: "Open 24 hours", lat: -15.409, lng: 28.32 },
  { id: "p4", name: "Northgate Pharmacy", area: "Chelstone", hours: "Open until 19:00", lat: -15.385, lng: 28.38 },
  { id: "p5", name: "Manda Hill Pharmacy", area: "Manda Hill", hours: "Open until 20:00", lat: -15.399, lng: 28.319 },
];

/** Cedar Health, where the demo pharmacist works. */
const PILOT_PHARMACY_ID = "p2";
const PILOT_STOCK = 50;

/** Defaults for the admin settings; existing values are never overwritten. */
const SETTINGS = {
  commissionBps: "1000",
  freePayoutsPerMonth: "1",
  minPayoutNgwee: "5000",
};

const DEMO_USERS = [
  { email: "customer@umuti.test", password: "umuti-demo-1234", fullName: "Thandiwe Banda", phone: "0977123456", role: "CUSTOMER" as Role, pharmacyId: null, isPharmacyOwner: false },
  { email: "pharmacist@umuti.test", password: "umuti-demo-1234", fullName: "Chanda Mwale", phone: "0966123456", role: "PHARMACIST" as Role, pharmacyId: "p2", isPharmacyOwner: true },
];

/** Creates the Supabase auth users so the demo logins work, if the key is set. */
async function seedAuthUsers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.log("! SUPABASE_SERVICE_ROLE_KEY not set - skipping demo logins.");
    console.log("  Catalogue is seeded; sign up through /sign-up instead.");
    return;
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  for (const u of DEMO_USERS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.fullName, phone: u.phone },
    });

    let id = data?.user?.id;
    if (error) {
      if (!/already/i.test(error.message)) throw error;
      const { data: list } = await admin.auth.admin.listUsers();
      id = list?.users.find((x) => x.email === u.email)?.id;
    }
    if (!id) continue;

    await prisma.profile.upsert({
      where: { id },
      create: { id, email: u.email, fullName: u.fullName, phone: u.phone, role: u.role, pharmacyId: u.pharmacyId, isPharmacyOwner: u.isPharmacyOwner },
      update: { role: u.role, pharmacyId: u.pharmacyId, isPharmacyOwner: u.isPharmacyOwner, fullName: u.fullName, phone: u.phone },
    });
    console.log(`  ${u.role.toLowerCase()}: ${u.email} / ${u.password}`);
  }
}

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: c });
  }

  for (const p of PRODUCTS) {
    const photo = PHOTOS[p.id];
    const { priceNgwee: _price, ...product } = p;
    const data = {
      ...product,
      aliases: p.aliases ?? [],
      classification: p.rx ? ("PRESCRIPTION" as const) : ("GENERAL" as const),
      imageSrc: photo?.src ?? null,
      imagePosition: photo?.position ?? null,
    };
    await prisma.product.upsert({ where: { id: p.id }, create: data, update: data });
  }
  // Keep the autoincrement sequence past the explicit ids above.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Product"', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "Product"))`,
  );

  for (const ph of PHARMACIES) {
    const pilot = ph.id === PILOT_PHARMACY_ID;
    const data = {
      ...ph,
      status: "ACTIVE" as const,
      offersDelivery: pilot,
      deliveryNote: pilot ? "Arranged with the pharmacy, paid on arrival" : null,
    };
    await prisma.pharmacy.upsert({ where: { id: ph.id }, create: data, update: data });
  }

  // The catalogue starts out stocked by one pilot pharmacy, at the prices it had before listings existed.
  for (const product of PRODUCTS) {
    const listing = { pharmacyId: PILOT_PHARMACY_ID, productId: product.id };
    await prisma.pharmacyProduct.upsert({
      where: { pharmacyId_productId: listing },
      create: { ...listing, priceNgwee: product.priceNgwee, stock: PILOT_STOCK },
      update: {},
    });
  }

  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
  }

  console.log(
    `Seeded ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ${PHARMACIES.length} pharmacies, ${PRODUCTS.length} listings at ${PILOT_PHARMACY_ID}.`,
  );
  await seedAuthUsers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
