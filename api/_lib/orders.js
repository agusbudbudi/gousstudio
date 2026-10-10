import { getRevisionQuota } from "../../src/utils/revisionQuota.js";

// Revision quota of the order's package, falling back to the live pricelist for orders
// created before package_details was snapshotted.
export async function getOrderRevisionQuota(supabase, order) {
  let pkg = order.package_details;
  if (!pkg && order.selected_package) {
    const { data } = await supabase
      .from('pricelists')
      .select('isrevisionunlimited, totalrevision')
      .eq('servicename', order.selected_package)
      .maybeSingle();
    pkg = data;
  }
  return getRevisionQuota(pkg);
}

// Next revision-history entry for an order, built from its current (server-side) state.
export async function buildRevisionEntry(supabase, order, { notes, source }) {
  const round = (order.revision_count || 0) + 1;
  // Over the package's quota is still allowed — the entry is flagged so the admin can charge for it
  const quota = await getOrderRevisionQuota(supabase, order);
  const entry = {
    round,
    notes,
    created_at: new Date().toISOString(),
    review_url: order.review_url || null,
    source,
    extra: quota !== null && round > quota,
  };
  return {
    round,
    revisionNotes: [...(Array.isArray(order.revision_notes) ? order.revision_notes : []), entry],
  };
}
