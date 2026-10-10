import { OrderItem } from "../types";

// Shared with the API so client and server agree on the quota (and the "extra" flag)
export { getRevisionQuota } from "./revisionQuota.js";

/** "2 dari 3", "Unlimited", or null when the package doesn't say. */
export const formatRevisionQuota = (used: number, quota: number | null) => {
  if (quota === null) return null;
  if (quota === Infinity) return "Unlimited";
  return `${used} dari ${quota}`;
};

/** Date `days` working days (Mon–Fri) after `from`, as "YYYY-MM-DD" in local time. */
export const addWorkingDays = (days: number, from: Date = new Date()) => {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Default extra working days given to the team for each revision round. */
export const REVISION_DAYS = 2;

export type AdminAction = { key: "payment" | "revision" | "approved"; label: string };

/**
 * What the client did that the admin now has to act on — shown as a badge in the CMS.
 * Null when the order is waiting on the client or nothing is pending.
 */
export const getAdminAction = (order: OrderItem): AdminAction | null => {
  if (order.status === "WAITING FOR PAYMENT" && order.payment_proof_url) {
    return { key: "payment", label: "Bukti bayar masuk" };
  }
  if (order.status === "REVIEWED" && order.approved_at) {
    return { key: "approved", label: "Disetujui klien" };
  }
  const latest = order.revision_notes?.[order.revision_notes.length - 1];
  if (order.status === "REVISION" && latest?.source === "client") {
    return { key: "revision", label: "Revisi diminta" };
  }
  return null;
};
