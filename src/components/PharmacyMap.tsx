"use client";

import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import type { Pharmacy } from "@/lib/data";

const PIN = (color: string) =>
  `<svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C7.6 2 4 5.5 4 9.8c0 6 8 12.2 8 12.2s8-6.2 8-12.2C20 5.5 16.4 2 12 2Zm0 11a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Z"/></svg>`;

/** OpenStreetMap (Leaflet) map with a pin per pharmacy and a preview popup. */
export function PharmacyMap({
  pharmacies,
  selectedId,
  onSelect,
}: {
  pharmacies: Pharmacy[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      const leaflet = (mod as unknown as { default?: typeof import("leaflet") }).default ?? mod;
      L.current = leaflet;
      const m = leaflet.map(el.current, { scrollWheelZoom: false }).setView([-15.41, 28.335], 12);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        })
        .addTo(m);
      map.current = m;
      layer.current = leaflet.layerGroup().addTo(m);
      renderMarkers();
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderMarkers = () => {
    const leaflet = L.current;
    if (!leaflet || !layer.current) return;
    layer.current.clearLayers();
    for (const p of pharmacies) {
      const selected = p.id === selectedId;
      const icon = leaflet.divIcon({
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28],
        html: PIN(selected ? "#0B425D" : "#0C8F6E"),
      });
      const popup = document.createElement("div");
      popup.style.cssText = "font-family:var(--font-body);min-width:180px;";
      popup.innerHTML =
        `<div style="font-weight:700;font-size:14px;color:#16323D;margin-bottom:4px;"></div>` +
        `<div style="font-size:12px;color:rgba(22,50,61,0.6);margin-bottom:2px;"></div>` +
        `<div style="font-size:12px;font-weight:700;color:#076B54;margin-bottom:10px;"></div>`;
      const [name, meta, hours] = Array.from(popup.children) as HTMLElement[];
      name.textContent = p.name;
      meta.textContent = `${p.area} · ${p.distance}`;
      hours.textContent = p.hours;
      const btn = document.createElement("button");
      btn.textContent = selected ? "Selected for pickup" : "Select for pickup";
      btn.style.cssText =
        "background:#0C8F6E;color:#fff;border:none;border-radius:999px;padding:8px 14px;font-weight:700;font-size:12.5px;cursor:pointer;width:100%;";
      btn.onclick = () => onSelectRef.current(p.id);
      popup.appendChild(btn);
      leaflet.marker([p.lat, p.lng], { icon }).bindPopup(popup).addTo(layer.current);
    }
  };

  useEffect(renderMarkers, [pharmacies, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className="map" aria-label="Map of partner pharmacies" />;
}
