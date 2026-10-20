import Link from "next/link";
import { LEGAL_DOCUMENTS } from "@/content/legal";

export const metadata = { title: "Legal | Umuti Express" };

export default function LegalIndexPage() {
  return (
    <div className="shell-container max-w-[760px] py-12">
      <h1 className="font-display text-[30px] font-bold">Legal</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">The terms and policies that apply to Umuti Express.</p>

      <ul className="mt-8 flex flex-col gap-3">
        {LEGAL_DOCUMENTS.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/legal/${d.slug}`}
              className="block rounded-card bg-white p-5 text-ink no-underline shadow-card transition-shadow hover:shadow-float"
            >
              <div className="font-display text-[17px] font-bold">{d.title}</div>
              <div className="mt-1 text-[13.5px] text-ink-62">{d.summary}</div>
              <div className="mt-2 text-[12px] text-ink-50">
                Version {d.version} &middot; Effective {d.effectiveDate}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
