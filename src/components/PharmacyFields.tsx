"use client";

import { useState } from "react";

export type PharmacyValues = {
  name: string;
  area: string;
  address: string;
  phone: string;
  hours: string;
  offersDelivery: boolean;
  deliveryNote: string;
};

export const EMPTY_PHARMACY: PharmacyValues = {
  name: "",
  area: "",
  address: "",
  phone: "",
  hours: "",
  offersDelivery: false,
  deliveryNote: "",
};

/** The pharmacy detail inputs, shared by the application form and the owner's settings. */
export function PharmacyFields({ defaults = EMPTY_PHARMACY }: { defaults?: PharmacyValues }) {
  const [delivery, setDelivery] = useState(defaults.offersDelivery);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pharmacy name" name="name" defaultValue={defaults.name} required />
        <Field label="Area" name="area" defaultValue={defaults.area} placeholder="Kabulonga" required />
      </div>
      <Field label="Street address" name="address" defaultValue={defaults.address} placeholder="Plot 14, Kabulonga Road" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact number" name="phone" type="tel" defaultValue={defaults.phone} placeholder="0977123456" required />
        <Field label="Opening hours" name="hours" defaultValue={defaults.hours} placeholder="Open until 20:00" required />
      </div>

      <label className="flex items-center gap-2.5 text-[14px] font-semibold text-ink-70">
        <input
          type="checkbox"
          name="offersDelivery"
          checked={delivery}
          onChange={(e) => setDelivery(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-green)]"
        />
        We arrange delivery with the customer
      </label>
      {delivery && (
        <Field
          label="Delivery terms shown to customers"
          name="deliveryNote"
          defaultValue={defaults.deliveryNote}
          placeholder="Arranged with the pharmacy, paid on arrival"
        />
      )}
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required = false,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-ink-70">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-inner bg-surface px-4 py-3 text-[14.5px] text-ink outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
      />
      {hint && <span className="mt-1 block text-[12px] text-ink-50">{hint}</span>}
    </label>
  );
}
