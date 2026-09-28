# Umuti Express

Online pharmacy for Lusaka, Zambia: browse medicines, upload prescriptions for pharmacist review,
find partner pharmacies on a map, check out with delivery (preferred) or pickup, pay with MTN or
Airtel mobile money via Lenco by BroadPay, track orders, reorder, and chat with a pharmacist.

Built with Next.js (App Router), React and TypeScript. The map uses Leaflet with OpenStreetMap tiles.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Structure

- `src/app/` one route per screen: `/`, `/shop`, `/product/[id]`, `/prescription/[id]`, `/pharmacies`,
  `/cart`, `/checkout`, `/order/confirmation`, `/track`, `/account`, `/chat`
- `src/lib/data.ts` catalog, pharmacies, seed orders and photo crops
- `src/lib/store.tsx` client state (cart, orders, checkout choices, chat), persisted to localStorage
- `src/components/` header, product card, map, image frames, icons
- `public/images/` photos placed in the design
- `project/`, `chats/` original Claude Design handoff bundle (reference only)

## Demo-only behaviour

Prescription review, order tracking updates, payment and pharmacist chat replies are simulated.
There is no backend yet; data lives in `src/lib/data.ts` and the browser's localStorage.
Products without a photo and pharmacy storefronts show a plain captioned placeholder.
