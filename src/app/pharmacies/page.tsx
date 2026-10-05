import Link from "next/link";
import { getPharmacies } from "@/lib/queries";
import { getProfile } from "@/lib/auth";
import { PharmacyMap } from "@/components/PharmacyMap";
import { SelectPharmacyButton } from "@/components/SelectPharmacyButton";
import { ImageSlot } from "@/components/ImageSlot";

export const metadata = { title: "Pharmacies near you | Umuti Express" };

export default async function PharmaciesPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const { area } = await searchParams;
  const [all, profile] = await Promise.all([getPharmacies(), getProfile()]);

  const areas = Array.from(new Set(all.map((p) => p.area)));
  const list = area ? all.filter((p) => p.area === area) : all;
  const selectedId = profile?.preferredPharmacyId ?? null;

  return (
    <div className="shell-container py-10">
      <h1 className="font-display text-[28px] font-bold">Pharmacies near you</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <AreaChip href="/pharmacies" active={!area}>
          All areas
        </AreaChip>
        {areas.map((a) => (
          <AreaChip key={a} href={`/pharmacies?area=${encodeURIComponent(a)}`} active={area === a}>
            {a}
          </AreaChip>
        ))}
      </div>

      <div className="mt-7 h-[380px] overflow-hidden rounded-card shadow-card">
        <PharmacyMap
          pharmacies={list.map((p) => ({
            id: p.id,
            name: p.name,
            area: p.area,
            hours: p.hours,
            lat: p.lat,
            lng: p.lng,
          }))}
          selectedId={selectedId}
        />
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {list.map((ph) => (
          <div key={ph.id} className="flex flex-wrap items-center gap-4 rounded-card bg-white p-4 shadow-card">
            <ImageSlot
              src={ph.imageSrc}
              placeholder="Storefront photo"
              className="h-24 w-24 shrink-0 rounded-inner text-[11px]"
            />

            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-bold">{ph.name}</div>
              <div className="mt-1 text-[13px] text-ink-55">{ph.area}</div>
              <div className="mt-1.5 text-[12.5px] font-bold text-green-dark">{ph.hours}</div>
            </div>

            {profile ? (
              <SelectPharmacyButton pharmacyId={ph.id} selected={selectedId === ph.id} />
            ) : (
              <Link href="/sign-in?next=/pharmacies" className="btn btn-secondary shrink-0">
                Sign in to select
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full px-4 py-2 text-[13.5px] font-semibold no-underline transition-colors ${
        active ? "bg-green text-white" : "bg-white text-ink-70 shadow-nav hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
