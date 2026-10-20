# Umuti Express

Online pharmacy for Lusaka, Zambia: browse medicines, upload prescriptions for pharmacist review,
find partner pharmacies on a map, check out with delivery (preferred) or pickup, pay with MTN or
Airtel mobile money via Lenco by BroadPay, track orders, reorder, and chat with a pharmacist.

Next.js (App Router) with React, TypeScript and Tailwind CSS. Data lives in Postgres via Prisma,
hosted on Supabase, which also provides authentication and prescription file storage. The map uses
Leaflet with OpenStreetMap tiles.

## Setup

```bash
npm install
cp .env.example .env.local      # fill in your Supabase project values
npm run db:push                 # create the tables
npm run db:seed                 # catalogue + demo logins
npm run dev                     # http://localhost:3000
```

`.env.local` needs the Supabase project URL and anon key, the pooled `DATABASE_URL` and direct
`DIRECT_URL` Postgres connection strings, and `SUPABASE_SERVICE_ROLE_KEY` for the seed's demo logins.

### Prescription storage

Create a **private** Storage bucket named `prescriptions`, then add this one policy, or uploads will
be rejected. Each patient writes only into a folder named after their own user id:

```sql
create policy "patients upload their own prescriptions"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'prescriptions'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

There is deliberately **no read policy**. The app opens a prescription with a one-minute link signed
by the server (using `SUPABASE_SERVICE_ROLE_KEY`) after checking that the file belongs to an order
placed with the pharmacist's own pharmacy, and writes every view to `AccessLog`. If you created the
earlier `staff read prescriptions` policy, drop it, or any pharmacist could read every prescription
straight from the Storage API:

```sql
drop policy if exists "staff read prescriptions" on storage.objects;
```

### Pharmacy document storage

Pharmacies upload their registration documents when they apply. Create a second **private** bucket
named `pharmacy-documents`, with these policies. Each applicant writes only into a folder named after
their own user id, and only that user or an admin can read:

```sql
create policy "applicants upload their own documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'pharmacy-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "owner or admin reads documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'pharmacy-documents'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from "Profile" p where p.id = auth.uid() and p.role = 'ADMIN')
  )
);
```

### Making an admin

Admins review pharmacy applications at `/dashboard/admin`. There is no sign-up route for it. Create
the account normally, then promote it in the Supabase SQL editor:

```sql
update "Profile" set role = 'ADMIN' where email = 'you@example.com';
```

If `SUPABASE_SERVICE_ROLE_KEY` is set, the seed also creates a demo customer and a demo pharmacist
and prints their logins in the terminal. Use it on a local or throwaway project only.

## Structure

- `src/app/` one route per screen: `/`, `/shop`, `/product/[id]`, `/prescription/[id]`, `/pharmacies`,
  `/cart`, `/checkout`, `/order/confirmation`, `/track`, `/account`, `/chat`, `/sign-in`, `/sign-up`,
  `/partner/apply` (a pharmacy applies to list), `/join/[token]` (staff accept an invite), and the
  staff-only `/dashboard` (orders, products, prescriptions, chats, settings; `/dashboard/admin` and
  `/dashboard/admin/catalogue` for admins)
- `prisma/schema.prisma` the data model; `prisma/seed.ts` the catalogue and demo users
- `src/lib/queries.ts` server-side reads, `src/lib/actions/` server actions (cart, orders,
  prescriptions, chat, account, pharmacies)
- `src/lib/auth.ts` session and role helpers; `src/proxy.ts` session refresh and route guards
- `src/lib/payments.ts` the single seam for the Lenco mobile money integration
- `src/components/` header, product card, map, image frames, toasts, icons
- `src/app/globals.css` Tailwind theme carrying the design tokens
- `project/`, `chats/` original Claude Design handoff bundle (reference only)

## Roles

- **Customer** shops, uploads prescriptions, orders and chats.
- **Pharmacy owner** applies at `/partner/apply` with registration documents. The pharmacy stays
  hidden and the owner has no staff access until an admin activates it. Owners edit the pharmacy's
  details and invite staff with single-use links from `/dashboard/settings`.
- **Verified pharmacist** is staff whose licence and practising certificate an admin has checked
  (`/dashboard/verification`, reviewed at `/dashboard/admin/pharmacists`). Only they can open or
  decide prescriptions, and the check lapses on the certificate's expiry date.
- **Pharmacist (staff)** joins through an invite link and manages their own pharmacy's orders,
  products, prescriptions and chats. Staff add products from the shared catalogue or submit new ones,
  which stay hidden from customers until an admin approves them and sets the classification. Every dashboard query and action is scoped to that pharmacy.
- **Admin** reviews applications, sets each pharmacy's map location and activates or suspends it.

A cart with a prescription item is checked out with the prescription attached. The order is placed
without a charge and goes to the pharmacy holding it; a verified pharmacist there approves or
refuses it. Approval opens payment, one refusal cancels the order and returns the stock. A pharmacy
with no order cannot open a prescription. Delivery orders have a printable rider label
(`/dashboard/orders/<code>/label`) holding the order code, first name, phone and address, and
nothing about the medicines. Order stages are advanced by the pharmacy that holds the order, not
the customer.

## Not wired up yet

Mobile money payment is simulated: `chargeMobileMoney` in `src/lib/payments.ts` returns a
successful reference unless `LENCO_API_KEY` is set, and the live request body is still to be
written against the Lenco API. Everything else — catalogue, cart, prescriptions, orders, tracking,
chat, accounts — reads and writes the database.

Money is stored as integer ngwee (1 kwacha = 100 ngwee) so totals stay exact; use `fmtK` from
`src/lib/format.ts` to display it.
