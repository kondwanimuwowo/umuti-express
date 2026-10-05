"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./icons";

export function SearchForm({ initial = "", compact = false }: { initial?: string; compact?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
      }}
      className={`flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-card ${compact ? "" : "w-full max-w-[520px]"}`}
    >
      <span className="shrink-0 text-ink-40">
        <SearchIcon />
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search medicines, e.g. paracetamol"
        aria-label="Search medicines"
        className="min-w-0 flex-1 border-0 bg-transparent py-2 text-[14.5px] text-ink outline-none placeholder:text-ink-40"
      />
      <button type="submit" className="btn btn-primary shrink-0">
        Search
      </button>
    </form>
  );
}
