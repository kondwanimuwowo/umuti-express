import Link from "next/link";
import { fillLegalText } from "@/lib/company";
import type { LegalContent } from "@/content/legal/types";

/** Renders a legal document: numbered headings, paragraphs and lists, with its version and date. */
export function LegalText({ doc }: { doc: LegalContent }) {
  return (
    <article className="shell-container max-w-[760px] py-12">
      <Link href="/legal" className="text-[13.5px] font-semibold text-ink-62 no-underline hover:text-ink">
        All legal documents
      </Link>
      <h1 className="mt-4 font-display text-[30px] leading-tight font-bold">{doc.title}</h1>
      <p className="mt-2 text-[13.5px] text-ink-55">
        Version {doc.version} &middot; Effective {doc.effectiveDate}
      </p>

      <nav aria-label="Contents" className="mt-8 rounded-card bg-white p-5 shadow-card">
        <ol className="grid list-none gap-x-8 gap-y-1.5 p-0 text-[13.5px] sm:grid-cols-2">
          {doc.sections.map((s, i) => (
            <li key={s.heading}>
              <a href={`#s${i + 1}`} className="text-ink-70 no-underline hover:text-ink hover:underline">
                {i + 1}. {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 flex flex-col gap-9">
        {doc.sections.map((s, i) => (
          <section key={s.heading} id={`s${i + 1}`} className="scroll-mt-24">
            <h2 className="font-display text-[19px] font-bold">
              {i + 1}. {s.heading}
            </h2>
            <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-ink-70">
              {s.blocks.map((b, j) =>
                typeof b === "string" ? (
                  <p key={j}>{fillLegalText(b)}</p>
                ) : (
                  <ul key={j} className="list-disc space-y-1.5 pl-5">
                    {b.list.map((item) => (
                      <li key={item}>{fillLegalText(item)}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
