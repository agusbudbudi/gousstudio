import { createClient } from "@supabase/supabase-js";
import { buildRevisionEntry } from "../_lib/orders.js";

const STALE_STATUS_MESSAGE = 'Status order sudah berubah (mis. klien baru minta revisi). Muat ulang lalu coba lagi.';

function getCmsToken(req) {
  const cookies = (req.headers.cookie || '').split(';');
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name === 'cms_token') return decodeURIComponent(rest.join('='));
  }
  return null;
}

export default async function handler(req, res) {
  const { action } = req.query;
  const { CMS_PASSWORD, SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const effectivePassword = CMS_PASSWORD;
  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;

  // Validate Auth
  if (!effectivePassword || getCmsToken(req) !== effectivePassword) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Server configuration missing' });
  }

  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  switch (action) {
    case 'get':
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json({ success: true, data: data || [] });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'create':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { data, error } = await supabase.from('orders').insert(req.body.payload).select().single();
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'update':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { id, updates, expectedStatus } = req.body;
        let query = supabase.from('orders').update(updates).eq('id', id);
        // Status transitions are guarded on the status the admin saw, so they can't silently
        // override something the client (or a webhook) did while the CMS view was open
        if (expectedStatus) query = query.eq('status', expectedStatus);
        const { data, error } = await query.select().maybeSingle();
        if (error) throw error;
        if (!data) {
          return expectedStatus
            ? res.status(409).json({ message: STALE_STATUS_MESSAGE })
            : res.status(404).json({ message: 'Order not found' });
        }

        // If payment is manually confirmed, mark the associated voucher as used
        if (updates.paid_amount !== undefined && data.referral_id) {
          await supabase.from('referral_codes').update({ is_used: true }).eq('id', data.referral_id);
        }

        // If an unpaid order reverts to DRAFT or is CANCELLED, release the voucher. A paid order
        // keeps it used: the payment is still held (or awaiting a manual refund).
        if ((updates.status === 'DRAFT' || updates.status === 'CANCELLED') && data.referral_id && !data.paid_at) {
          await supabase.from('referral_codes').update({ is_used: false }).eq('id', data.referral_id);
        }

        return res.status(200).json({ success: true, data });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'log-revision':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        // Admin-logged REVIEWED → REVISION. Built from the current row (not the CMS's copy) so a
        // revision the client just submitted isn't overwritten or counted twice.
        const { id, notes, deadline } = req.body || {};
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('id, status, revision_count, revision_notes, review_url, package_details, selected_package')
          .eq('id', id)
          .single();
        if (orderError || !order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'REVIEWED') return res.status(409).json({ message: STALE_STATUS_MESSAGE });

        const { round, revisionNotes } = await buildRevisionEntry(supabase, order, {
          notes: typeof notes === 'string' ? notes.trim() : '',
          source: 'admin',
        });
        const { data, error } = await supabase
          .from('orders')
          .update({
            status: 'REVISION',
            revision_count: round,
            revision_notes: revisionNotes,
            approved_at: null,
            ...(deadline ? { deadline } : {}),
          })
          .eq('id', order.id)
          .eq('status', 'REVIEWED')
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) return res.status(409).json({ message: STALE_STATUS_MESSAGE });
        return res.status(200).json({ success: true, data });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'delete':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { data: orderToDelete } = await supabase.from('orders').select('referral_id').eq('id', req.body.id).single();
        const { error } = await supabase.from('orders').delete().eq('id', req.body.id);
        if (error) throw error;

        // Automatically release bound voucher when order is wiped
        if (orderToDelete && orderToDelete.referral_id) {
          await supabase.from('referral_codes').update({ is_used: false }).eq('id', orderToDelete.referral_id);
        }

        return res.status(200).json({ success: true, message: 'Deleted' });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'list-referrals':
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { data, error } = await supabase
          .from('referral_codes')
          .select('*, orders!order_id(order_number, full_name)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const usedReferralIds = data.filter(d => d.is_used).map(d => d.id);
          if (usedReferralIds.length > 0) {
            const { data: usedOrders } = await supabase
              .from('orders')
              .select('order_number, referral_id')
              .in('referral_id', usedReferralIds);

            if (usedOrders) {
              data.forEach(ref => {
                if (ref.is_used) {
                  const usedBy = usedOrders.find(o => o.referral_id === ref.id);
                  if (usedBy) ref.used_on_order = usedBy.order_number;
                }
              });
            }
          }
        }

        return res.status(200).json({ success: true, data });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    default:
      return res.status(400).json({ message: 'Invalid action' });
  }
}
