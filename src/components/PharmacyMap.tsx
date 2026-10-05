"use client";

import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

export type MapPharmacy = {
  id: string;
  name: string;
  area: string;
  hours: string;
  lat: number;
  lng: number;
};

type Leaflet = typeof import("leaflet");

const PIN = (color: string) =>
  `<svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C7.6 2 4 5.5 4 9.8c0 6 8 12.2 8 12.2s8-6.2 8-12.2C20 5.5 16.4 2 12 2Zm0 11a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Z"/></svg>`;

function popupFor(p: MapPharmacy) {
  const el = document.createElement("div");
  el.style.cssText = "font-family:var(--font-body);min-width:180px;";

  const name = document.createElement("div");
  name.style.cssText = "font-weight:700;font-size:14px;color:#16323D;margin-bottom:4px;";
  name.textContent = p.name;

  const area = document.createElement("div");
  area.style.cssText = "font-size:12px;color:rgba(22,50,61,0.6);margin-bottom:2px;";
  area.textContent = p.area;

  const hours = document.createElement("div");
  hours.style.cssText = "font-size:12px;font-weight:700;color:#076B54;";
  hours.textContent = p.hours;

  el.append(name, area, hours);
  return el;
}

function drawPins(leaflet: Leaflet, layer: LayerGroup, pharmacies: MapPharmacy[], selectedId: string | null) {
  layer.clearLayers();

  for (const p of pharmacies) {
    const icon = leaflet.divIcon({
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
      html: PIN(p.id === selectedId ? "#0B425D" : "#0C8F6E"),
    });
    leaflet.marker([p.lat, p.lng], { icon }).bindPopup(popupFor(p)).addTo(layer);
  }
}

/** OpenStreetMap (Leaflet) map with a pin per pharmacy and a preview popup. */
export function PharmacyMap({
  pharmacies,
  selectedId,
}: {
  pharmacies: MapPharmacy[];
  selectedId: string | null;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<Leaflet | null>(null);

  // Latest props for the initial draw, which runs once Leaflet has loaded.
  const latest = useRef({ pharmacies, selectedId });
  latest.current = { pharmacies, selectedId };

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      const leaflet = (mod as unknown as { default?: Leaflet }).default ?? (mod as Leaflet);
      leafletRef.current = leaflet;

      const m = leaflet.map(el.current, { scrollWheelZoom: false }).setView([-15.41, 28.335], 12);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        })
        .addTo(m);

      map.current = m;
      layer.current = leaflet.layerGroup().addTo(m);
      drawPins(leaflet, layer.current, latest.current.pharmacies, latest.current.selectedId);
    });

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      layer.current = null;
    };
  }, []);

  // Re-pin when the filtered list or the selection changes.
  useEffect(() => {
    if (leafletRef.current && layer.current) {
      drawPins(leafletRef.current, layer.current, pharmacies, selectedId);
    }
  }, [pharmacies, selectedId]);

  return <div ref={el} className="h-full w-full" aria-label="Map of partner pharmacies" />;
}
