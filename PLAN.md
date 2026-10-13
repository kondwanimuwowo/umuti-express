# Umuti Express: marketplace plan

Umuti Express becomes a marketplace of independent partner pharmacies. Each pharmacy lists medicines
from a shared catalogue, sets its own price and stock, and fulfils its own orders (pickup, or
delivery arranged between pharmacy and buyer and paid on arrival). Pharmacists can also offer paid
consultations. Online only for now; in-store POS is out of scope.

One phase = one commit. Each phase ends with typecheck, build and a manual check before committing.
Nothing is pushed without asking.

## Decisions made

| Topic | Decision |
| --- | --- |
| Catalogue | Pharmacies add products. Search-as-you-type suggests existing entries so the next pharmacy adds in one click. New products are visible only to the adding pharmacy until admin approves. |
| Prescription flag | Follows ZAMRA's registered category. Only admin can loosen it; pharmacies can only make a product stricter. |
| Pricing | Per pharmacy. |
| Batches and expiry | Not now. Stock is a single quantity; leave room to add batches later. |
| Commission | 10% of medicines (not delivery), an admin setting. Lenco's fee comes out of our share (1% mobile money, 3.5% local card). Rate and Lenco fee are saved on each order. |
| Delivery | Arranged between pharmacy and buyer, paid on arrival. Not part of our payment. |
| Payouts | One free payout per calendar month (we pay Lenco's fee, K8.50 to K35). Extra payouts on request, fee deducted from the pharmacy. Minimum payout applies. |
| Staff accounts | Pharmacy owner invites staff; admin approves the pharmacy once. |
| Prescriptions | Belong to the customer and can be used at any pharmacy (see assumption below). |
| Search | Postgres (`pg_trgm` plus generic names and brand aliases). No Algolia. |
| Copy | Listings only. No advertising language, health claims or promotions. |

## Assumptions to confirm

- **Prescriptions at any pharmacy.** The file stays private. A pharmacy sees a prescription only when
  it is attached to an order placed with that pharmacy. That pharmacy's pharmacist reviews it
  before dispensing; an approval stays valid for that customer and product, and later orders at
  other pharmacies reuse it, with the dispensing pharmacist still free to refuse.
- **Holding funds.** Customer payments sit with us until payout. Ask Lenco whether it can settle
  directly or split payments, and ask a lawyer about Bank of Zambia implications, before Phase 7.
- **Online sale of prescription medicines.** Confirm with a Zambian pharmaceutical lawyer whether
  ZAMRA permits it and whether an online-pharmacy licence is needed, before launch.

## Phases

### Phase 0: Fixes and housekeeping
- `prisma.config.ts`: read `DIRECT_URL` via `process.env` so the Vercel `prisma generate` step passes.
- `.env.example`: rename `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `addToCart`: enforce prescription approval, or correct the README wording.
- Remove the demo logins from the README; rotate or delete the demo users in any deployed project.
- Set Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL`.
- Fix the mismatched product photos.
- Done when: Vercel build passes and the site loads on the deployed URL.
- Commit: `fix: unblock Vercel build and tidy setup`

### Phase 1: Schema foundation
- Add models: `PharmacyProduct`, `LedgerEntry`, `Payout`, `Setting`, `PharmacistProfile`,
  `VerificationDocument` (licences for pharmacies and pharmacists), `Consultation`, `LegalDocument`,
  `LegalAcceptance`, `AccessLog`.
- `Product` gains `genericName`, `aliases[]`, `strength`, `form`, `packSize`, `classification`,
  `status`, `createdByPharmacyId`. `Pharmacy` gains `status`, `offersDelivery`, `deliveryNote`;
  `Profile` gains `isPharmacyOwner`.
- `Order` gains commission and gateway-fee snapshots (null until Phase 7).
- Legacy columns stay so the app keeps working: `Product.priceNgwee` and `inStock` (dropped in
  Phase 2 when the app reads `PharmacyProduct`), `Product.rx` (replaced by `classification` in
  Phase 4), `Order.deliveryNgwee` (dropped in Phase 2).
- Enable `pg_trgm`; add trigram indexes on name and generic name. Aliases are searched in Phase 2.
- Migration: carry the existing catalogue, prices and stock over to a pilot pharmacy (Cedar Health).
- Seed settings (`commissionBps=1000`, `freePayoutsPerMonth=1`, `minPayoutNgwee=5000`) and generic
  names and aliases for the seeded products.
- Done when: `db:push`/migrate and seed run clean, the app still builds, and existing pages still render.
- Commit: `feat(db): add marketplace schema, settings and search fields`

### Phase 2: Catalogue, search and cart
- Search across name, generic name and aliases with typo tolerance ("paracetamol" finds Panadol,
  "panado" finds it too). Search results page and header search box.
- Product page lists the pharmacies that stock the product, with each price and a pickup or
  delivery note; "Same active ingredient" shows related brands.
- Cart holds items from one pharmacy only; switching pharmacies asks to clear the cart.
- Checkout: pickup or delivery choice, no delivery fee, totals use the pharmacy's prices.
- Done when: searching both a generic and a brand name returns the right products, and an order
  stores the pharmacy, prices and fulfilment.
- Commit: `feat(catalogue): generic-name search and per-pharmacy pricing`

### Phase 3: Pharmacy dashboard and scoping
- Move staff pages under `/dashboard` with a sidebar: Orders, Products, Prescriptions, Chats,
  Balance, Settings.
- Scope every staff query to the staff member's pharmacy (orders, prescriptions, chats).
- Orders page: list, filter, advance status (closes the existing gap where staff cannot advance orders).
- Pharmacy onboarding: an application form (name, area, map location, hours, contact, delivery
  terms), an owner account, and upload of the pharmacy's registration and business licence to a
  private bucket. The pharmacy starts as `PENDING`, admin reviews the documents and activates it.
  Which documents are mandatory is for the lawyer to confirm. Pharmacies do not go public until
  Phase 6 adds the partner agreement they must accept.
- Owner invites staff.
- Done when: a pharmacist at one pharmacy cannot see or change another pharmacy's data (verified by
  trying), and a new pharmacy stays hidden until admin activates it.
- Commit: `feat(dashboard): pharmacy dashboard with branch scoping and order management`

### Phase 4: Inventory and catalogue management
- "My products" with typeahead add: type, pick an existing product or create a new one, then set
  price and stock.
- Duplicate warning on near-matching names.
- Admin catalogue approval queue; classification (prescription-only and so on) editable by admin only.
- Pharmacies can edit price, stock and active status of their own listings.
- Done when: a second pharmacy can add an existing product in a few clicks, and a pending product is
  hidden from customers until approved.
- Commit: `feat(inventory): pharmacy product management and catalogue approval`

### Phase 5: Prescriptions and privacy
- Prescription review moves to the pharmacy holding the order.
- Short-lived signed URLs only; every view written to `AccessLog`.
- Printable rider label: order code, first name, phone, address. No medicine names, no prescription
  details.
- Customer consent at checkout to share details with the chosen pharmacy.
- Done when: a pharmacy with no order cannot open a prescription, and the label carries no health data.
- Commit: `feat(privacy): order-level prescription review, access log and rider label`

### Phase 6: Legal pages and copy
- Terms, Privacy Policy, medical disclaimer, pharmacy partner agreement, consultation terms.
  Text drafted by a lawyer; we build the pages and version them.
- Acceptance tracking: partner agreement at pharmacy onboarding, terms at sign-up.
- Audit all copy (homepage, product blurbs, seed data) against the no-advertising rule.
- Done when: pharmacy onboarding cannot complete without accepting the current agreement version.
- Commit: `feat(legal): legal pages, acceptance tracking and copy audit`

### Phase 7: Money
- Live Lenco collections replacing the simulated `chargeMobileMoney`.
- Ledger entries written per order: pharmacy earning, commission, gateway fee (snapshotted).
- Balance page for pharmacies; admin settings for commission, free payouts and minimum payout.
- Payouts: automatic monthly free run; on-request extra payouts with the fee shown first and deducted.
- Refund handling writes reversing ledger entries.
- Done when: a test order produces correct ledger rows, and a payout run produces the right transfer
  and fee.
- Commit: `feat(payments): Lenco collections, ledger and payouts`

### Phase 8: Consultations
- Pharmacist sign-up with licence and practising certificate upload to a private bucket.
- Admin verification queue; expiry dates auto-suspend the pharmacist.
- Paid consultation: customer pays up front, held until completion, chat-based first.
- Earnings go through the same ledger and payout run.
- Done when: a verified pharmacist completes a paid consultation and the earning appears in their balance.
- Commit: `feat(consultations): verified pharmacists and paid consultations`

### Phase 9: Hardening
- Friendly error pages and connection retry; notifications for orders and prescriptions.
- Reports (sales, commission, payouts) for admin and pharmacies.
- Tests for money maths, scoping and prescription gating; production `next build` run clean.
- Commit: `chore: error handling, notifications, reports and tests`

## Out of scope for now
- Stock batches and expiry tracking.
- In-store POS.
- Voice or video consultations.
- Delivery handled by us.
