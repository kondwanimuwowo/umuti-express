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

Create a **private** Storage bucket named `prescriptions`, then add these policies, or uploads will
be rejected. Each patient writes only into a folder named after their own user id, and only staff
can read:

```sql
create policy "patients upload their own prescriptions"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'prescriptions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "staff read prescriptions"
on storage.objects for select to authenticated
using (
  bucket_id = 'prescriptions'
  and exists (
    select 1 from "Profile" p
    where p.id = auth.uid() and p.role in ('PHARMACIST', 'ADMIN')
  )
);
```

If `SUPABASE_SERVICE_ROLE_KEY` is set, the seed also creates a demo customer and a demo pharmacist
and prints their logins in the terminal. Use it on a local or throwaway project only.

## Structure

- `src/app/` one route per screen: `/`, `/shop`, `/product/[id]`, `/prescription/[id]`, `/pharmacies`,
  `/cart`, `/checkout`, `/order/confirmation`, `/track`, `/account`, `/chat`, `/sign-in`, `/sign-up`,
  and the staff-only `/pharmacist` and `/pharmacist/chats`
- `prisma/schema.prisma` the data model; `prisma/seed.ts` the catalogue and demo users
- `src/lib/queries.ts` server-side reads, `src/lib/actions/` server actions (cart, orders,
  prescriptions, chat, account, pharmacies)
- `src/lib/auth.ts` session and role helpers; `src/proxy.ts` session refresh and route guards
- `src/lib/payments.ts` the single seam for the Lenco mobile money integration
- `src/components/` header, product card, map, image frames, toasts, icons
- `src/app/globals.css` Tailwind theme carrying the design tokens
- `project/`, `chats/` original Claude Design handoff bundle (reference only)

## Roles

A customer uploads a prescription; only a `PHARMACIST` or `ADMIN` can approve it, from
`/pharmacist`. An Rx product cannot be added to the cart or checked out until an approved
prescription exists for it, and that rule is enforced in the server action rather than the UI.
Order tracking stages are advanced by staff, not the customer.

## Not wired up yet

Mobile money payment is simulated: `chargeMobileMoney` in `src/lib/payments.ts` returns a
successful reference unless `LENCO_API_KEY` is set, and the live request body is still to be
written against the Lenco API. Everything else — catalogue, cart, prescriptions, orders, tracking,
chat, accounts — reads and writes the database.

Money is stored as integer ngwee (1 kwacha = 100 ngwee) so totals stay exact; use `fmtK` from
`src/lib/format.ts` to display it.
