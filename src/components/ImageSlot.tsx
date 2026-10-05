import type { CSSProperties } from "react";

/**
 * Photo frame. Renders `src` when the product or slot has a photo, otherwise a
 * plain captioned placeholder (inert, no uploader).
 */
export function ImageSlot({
  src,
  position,
  placeholder,
  className = "",
  style,
  eager = false,
}: {
  src?: string | null;
  position?: string | null;
  placeholder: string;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-green-tint px-5 text-center text-[12.5px] leading-snug font-semibold text-ink-55 ${className}`}
        style={style}
        role="img"
        aria-label={placeholder}
      >
        {placeholder}
      </div>
    );
  }
  return (
    <div className={`overflow-hidden bg-green-tint ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={placeholder.replace(/^Photo: /, "")}
        className="block h-full w-full object-cover"
        style={{ objectPosition: position ?? "50% 50%" }}
        loading={eager ? "eager" : "lazy"}
      />
    </div>
  );
}
