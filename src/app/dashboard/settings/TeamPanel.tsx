"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvite, removeStaff, revokeInvite } from "@/lib/actions/partner";
import { fmtDate } from "@/lib/format";
import { useToast } from "@/components/Toast";

type Member = { id: string; fullName: string | null; email: string; isPharmacyOwner: boolean };
type Invite = { id: string; token: string; label: string | null; expiresAt: string };

export function TeamPanel({ selfId, members, invites }: { selfId: string; members: Member[]; invites: Invite[] }) {
  const [label, setLabel] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const joinUrl = (token: string) => `${window.location.origin}/join/${token}`;

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(joinUrl(token));
      toast("Invite link copied");
    } catch {
      toast("Copy the link from the box instead.", "error");
    }
  };

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok && res.error) toast(res.error, "error");
      else if (res.message) toast(res.message);
      router.refresh();
    });

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <ul className="flex flex-col divide-y divide-black/[0.08]">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
            <div className="min-w-0">
              <div className="truncate text-[14px] font-bold">{m.fullName ?? m.email}</div>
              <div className="text-[12.5px] text-ink-50">{m.isPharmacyOwner ? "Owner" : "Staff"} &middot; {m.email}</div>
            </div>
            {!m.isPharmacyOwner && m.id !== selfId && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => removeStaff({ profileId: m.id }))}
                className="text-[13px] font-bold text-ink-40 hover:text-ink disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {invites.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-[13px] font-bold text-ink-70">Open invites</h3>
          <ul className="flex flex-col gap-2">
            {invites.map((i) => (
              <li key={i.id} className="rounded-inner bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="font-semibold">{i.label ?? "Invite"}</span>
                  <span className="text-ink-50">expires {fmtDate(new Date(i.expiresAt))}</span>
                </div>
                <input
                  readOnly
                  value={`/join/${i.token}`}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Invite link"
                  className="mt-2 w-full rounded-md bg-white px-3 py-2 text-[12.5px] text-ink-62"
                />
                <div className="mt-2 flex gap-4 text-[13px] font-bold">
                  <button type="button" onClick={() => copy(i.token)} className="text-green-dark">
                    Copy link
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => revokeInvite({ id: i.id }))}
                    className="text-ink-40 hover:text-ink"
                  >
                    Revoke
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        className="mt-6 flex gap-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const res = await createInvite({ label });
            if (res.ok) {
              setLabel("");
              await copy(res.token);
            } else {
              toast(res.error, "error");
            }
            router.refresh();
          });
        }}
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Who is it for? (optional)"
          aria-label="Invite label"
          className="min-w-0 flex-1 rounded-full bg-surface px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
        />
        <button type="submit" className="btn btn-secondary" disabled={pending}>
          Create invite link
        </button>
      </form>
      <p className="mt-2 text-[12px] text-ink-50">Links work once and expire after 7 days. Send them only to your staff.</p>
    </div>
  );
}
