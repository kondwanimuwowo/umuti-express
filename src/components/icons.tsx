// Solid-style icon set used across the site. Sizes are passed per use.

type P = { size?: number };

export const LogoMark = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <rect x="2" y="9" width="20" height="6" rx="3" />
    <line x1="12" y1="9" x2="12" y2="15" stroke="#0C8F6E" strokeWidth="1.5" />
  </svg>
);

export const UserIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7v1H4v-1Z" />
  </svg>
);

export const BagIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" fill="currentColor" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

export const MenuIcon = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const SearchIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <rect x="16.5" y="16.5" width="6" height="2.6" rx="1.3" transform="rotate(45 16.5 16.5)" fill="currentColor" />
  </svg>
);

export const CheckIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 13l4.5 4.5L19 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronLeft = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ClockIcon = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5.5l4 2.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const UploadIcon = ({ size = 24 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 3l4.5 4.5h-3v6h-3v-6h-3L12 3Z" />
    <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3h-2v3H7v-3H5Z" />
  </svg>
);

export const TruckIcon = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M3 6h11v9H3z" />
    <path d="M14 10h4l3 3v2h-7z" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

export const StoreIcon = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4 9l1-5h14l1 5H4Z" />
    <path d="M5 9v9a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9H5Z" />
  </svg>
);

const C = "#076B54";

export const CategoryIcon = ({ id }: { id: string }) => {
  switch (id) {
    case "pain":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke={C} strokeWidth="2" />
          <path d="M8 12h8M12 8v8" stroke={C} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "malaria":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="2" y="9" width="20" height="6" rx="3" fill={C} />
          <line x1="12" y1="9" x2="12" y2="15" stroke="#EAF6F1" strokeWidth="1.5" />
        </svg>
      );
    case "chronic":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke={C} strokeWidth="2" />
          <path d="M12 7v5.5l4 2.2" stroke={C} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "cold":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill={C} aria-hidden>
          <path d="M12 2c-3 4-5 7-5 10a5 5 0 0 0 10 0c0-3-2-6-5-10Z" />
        </svg>
      );
    case "vitamins":
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill={C} aria-hidden>
          <circle cx="8" cy="9" r="3.5" />
          <circle cx="16" cy="9" r="3.5" />
          <circle cx="12" cy="16" r="3.5" />
        </svg>
      );
    default:
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill={C} aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7v1H4v-1Z" />
        </svg>
      );
  }
};
