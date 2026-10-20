/** Money is stored as integer ngwee. 1 kwacha = 100 ngwee. */
export function fmtK(ngwee: number): string {
  return "K" + (ngwee / 100).toFixed(2);
}

export function kwacha(k: number): number {
  return Math.round(k * 100);
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

export function fmtDate(d: Date): string {
  return DATE.format(d);
}

export function fmtTime(d: Date): string {
  return TIME.format(d);
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  AWAITING_PAYMENT: "Awaiting payment",
  PREPARING: "Preparing",
  READY: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const RX_STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting pharmacist review",
  APPROVED: "Approved",
  REJECTED: "Not approved",
};

/** Tracking stages shown on /track, in order, per fulfilment type. */
export const DELIVERY_STAGES = ["PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED"] as const;
export const PICKUP_STAGES = ["PREPARING", "READY", "COMPLETED"] as const;
