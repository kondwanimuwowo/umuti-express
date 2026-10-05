/**
 * Mobile money via Lenco by BroadPay.
 *
 * The real integration is not wired up yet. This module is the single seam for
 * it: `chargeMobileMoney` keeps the shape a provider call would have (async,
 * fallible, returns a reference), so swapping the body for an HTTP request does
 * not touch the checkout action. Set LENCO_API_KEY to enable the live path.
 */

export type ChargeInput = {
  method: "MTN" | "AIRTEL";
  phone: string;
  amountNgwee: number;
};

export type ChargeResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

export async function chargeMobileMoney(input: ChargeInput): Promise<ChargeResult> {
  if (input.amountNgwee <= 0) return { ok: false, error: "Nothing to pay." };

  if (!process.env.LENCO_API_KEY) {
    // Simulated settlement, so checkout is testable without provider credentials.
    return { ok: true, reference: `SIM-${input.method}-${Date.now()}` };
  }

  throw new Error("Live Lenco charge is not implemented yet; unset LENCO_API_KEY to simulate.");
}
