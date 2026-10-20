"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewProduct } from "@/lib/actions/catalogue";
import { CLASSIFICATIONS, CLASSIFICATION_LABEL } from "@/lib/catalogue";
import { Field } from "@/components/PharmacyFields";
import { useToast } from "@/components/Toast";
import type { ProductClassification } from "@/generated/prisma";

type Props = {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  name: string;
  genericName: string | null;
  aliases: string[];
  strength: string | null;
  form: string | null;
  packSize: string | null;
  blurb: string;
  categorySlug: string;
  classification: ProductClassification;
  addedBy: string | null;
  categories: { slug: string; name: string }[];
};

export function ProductReviewCard(p: Props) {
  const [classification, setClassification] = useState<ProductClassification>(p.classification);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const decide = (form: HTMLFormElement, decision: "APPROVE" | "REJECT" | "SAVE") =>
    startTransition(async () => {
      const fd = new FormData(form);
      const value = (key: string) => String(fd.get(key) ?? "");
      const res = await reviewProduct({
        id: p.id,
        decision,
        name: value("name"),
        genericName: value("genericName"),
        aliases: value("aliases"),
        strength: value("strength"),
        form: value("form"),
        packSize: value("packSize"),
        blurb: value("blurb"),
        categorySlug: value("categorySlug"),
        classification,
        note,
      });
      if (res.ok) {
        toast(res.message);
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });

  const pendingReview = p.status === "PENDING";

  return (
    <form
      className="rounded-card bg-white p-6 shadow-card"
      onSubmit={(e) => {
        e.preventDefault();
        decide(e.currentTarget, pendingReview ? "APPROVE" : "SAVE");
      }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[17px] font-bold">{p.name}</h2>
        <span className="text-[12.5px] text-ink-50">
          {p.addedBy ? `Added by ${p.addedBy}` : "Catalogue"} &middot; #{p.id}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name" name="name" defaultValue={p.name} required />
        <Field label="Active ingredient" name="genericName" defaultValue={p.genericName ?? ""} />
        <Field label="Strength" name="strength" defaultValue={p.strength ?? ""} />
        <Field label="Form" name="form" defaultValue={p.form ?? ""} />
        <Field label="Pack size" name="packSize" defaultValue={p.packSize ?? ""} />
        <Field label="Other names" name="aliases" defaultValue={p.aliases.join(", ")} hint="Comma separated" />
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-ink-70">Category</span>
          <select
            name="categorySlug"
            defaultValue={p.categorySlug}
            className="w-full rounded-inner bg-surface px-4 py-3 text-[14.5px] text-ink outline-none focus:ring-2 focus:ring-green"
          >
            {p.categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-ink-70">Classification</span>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value as ProductClassification)}
            className="w-full rounded-inner bg-surface px-4 py-3 text-[14.5px] text-ink outline-none focus:ring-2 focus:ring-green"
          >
            {CLASSIFICATIONS.map((c) => (
              <option key={c} value={c}>
                {CLASSIFICATION_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[13px] font-bold text-ink-70">Description shown to customers</span>
        <textarea
          name="blurb"
          defaultValue={p.blurb}
          rows={2}
          required
          className="w-full resize-y rounded-inner bg-surface px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-green"
        />
      </label>

      {pendingReview && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[13px] font-bold text-ink-70">
            Note <span className="font-normal text-ink-50">(required to reject)</span>
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-inner bg-surface px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-green"
          />
        </label>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pendingReview ? "Approve" : "Save changes"}
        </button>
        {pendingReview && (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={pending || !note.trim()}
            onClick={(e) => decide(e.currentTarget.form!, "REJECT")}
          >
            Reject
          </button>
        )}
      </div>
    </form>
  );
}
