import type { CSSProperties } from "react";
import { photo } from "@/lib/data";

/**
 * Photo frame. Shows the photo placed in the design for `id` when one exists,
 * otherwise a plain placeholder with a caption (inert, no uploader).
 */
export function ImageSlot({
  id,
  placeholder,
  className = "",
  style,
  eager = false,
}: {
  id: string;
  placeholder: string;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
}) {
  const p = photo(id);
  if (!p) {
    return (
      <div className={`img-slot img-slot-empty ${className}`} style={style} role="img" aria-label={placeholder}>
        {placeholder}
      </div>
    );
  }
  return (
    <div className={`img-slot ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.src} alt={placeholder.replace(/^Photo: /, "")} style={{ objectPosition: p.position }} loading={eager ? "eager" : "lazy"} />
    </div>
  );
}
