import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, order_id, project, status, payment_method, completed_at, is_sandbox } = req.body || {};

    const {
      SUPABASE_URL,
      VITE_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      PAKASIR_API_KEY,
      VITE_PAKASIR_SLUG
    } = process.env;

    const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;

    if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ message: 'Server configuration missing' });
    }

    const expectedSlug = VITE_PAKASIR_SLUG || "gous-studio";
    if (project !== expectedSlug) {
      return res.status(400).json({ message: 'Invalid project slug' });
    }

    // Recommended: Validate via Pakasir API
    if (PAKASIR_API_KEY) {
      const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${project}&amount=${amount}&order_id=${order_id}&api_key=${PAKASIR_API_KEY}`;
      const response = await fetch(verifyUrl);
      const data = await response.json();
      
      if (!data.transaction || data.transaction.status !== 'completed') {
        return res.status(400).json({ message: 'Transaction validation failed or not completed' });
      }
    }

    // Wait, if it's completed, we update the status in Supabase
    if (status === 'completed') {
      const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);
      
      // Select the order first to ensure it exists
      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('id, status, price, final_price, referral_id, internal_notes, paid_at')
        .eq('order_number', order_id)
        .single();
        
      if (fetchError || !existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const expectedAmount = existingOrder.final_price ?? existingOrder.price ?? 0;
      // A missing amount is NaN, which would slip past the `<` check below
      if (!Number.isFinite(Number(amount)) || Number(amount) < Number(expectedAmount)) {
        console.warn(`Partial payment detected for Order ${order_id}: Paid ${amount}, Expected ${expectedAmount}`);
        return res.status(400).json({ 
          message: 'Invalid amount: paid amount is less than expected', 
          expected: expectedAmount, 
          paid: amount 
        });
      }
      
      // Only a pending order moves forward. A resent webhook for an already-paid order is a
      // no-op, so it can't push REVIEWED/DONE back to IN PROGRESS.
      if (existingOrder.status !== 'WAITING FOR PAYMENT') {
        const alreadyPaid = ['IN PROGRESS', 'REVISION', 'REVIEWED', 'DONE'].includes(existingOrder.status);
        // paid_at set means a resent webhook for a payment already recorded below
        if (!alreadyPaid && !existingOrder.paid_at) {
          // Paid after being cancelled / reverted to draft: keep the status, but record the
          // payment (so the client's status polling completes) and flag it for the admin
          console.warn(`Payment received for Order ${order_id} in status ${existingOrder.status}`);
          const flag = `[${new Date().toISOString().slice(0, 10)}] Pembayaran QRIS Rp${Number(amount).toLocaleString('id-ID')} diterima saat status ${existingOrder.status} — cek & proses refund bila perlu.`;
          await supabase
            .from('orders')
            .update({
              payment_method: payment_method || null,
              paid_amount: amount,
              paid_at: completed_at || new Date().toISOString(),
              is_sandbox: is_sandbox || false,
              internal_notes: existingOrder.internal_notes ? `${existingOrder.internal_notes}\n${flag}` : flag,
            })
            .eq('id', existingOrder.id)
            .eq('status', existingOrder.status);
        }
        return res.status(200).json({ message: 'Webhook received; order not awaiting payment', status: existingOrder.status });
      }

      // Update order status to IN PROGRESS immediately after payment
      const { data: orderData, error: dbError } = await supabase
        .from('orders')
        .update({
          status: 'IN PROGRESS',
          payment_method: payment_method || null,
          paid_amount: amount || null,
          paid_at: completed_at || new Date().toISOString(),
          is_sandbox: is_sandbox || false
        })
        .eq('order_number', order_id)
        .eq('status', 'WAITING FOR PAYMENT')
        .select('id, order_number, status')
        .maybeSingle();

      if (dbError) {
        return res.status(500).json({ message: 'Failed to update order status', error: dbError.message });
      }
      // Lost a race with a concurrent retry that already moved it — nothing left to do
      if (!orderData) {
        return res.status(200).json({ message: 'Webhook received; order already processed' });
      }

      // Mark voucher as used if payment is successful
      if (existingOrder.referral_id) {
        await supabase
          .from('referral_codes')
          .update({ is_used: true })
          .eq('id', existingOrder.referral_id);
      }

      console.log(`Order ${order_id} payment successful, status updated.`);
      return res.status(200).json({ message: 'Webhook processed successfully', order: orderData });
    }

    return res.status(200).json({ message: 'Webhook received but status not completed' });
  } catch (err) {
    console.error("Pakasir Webhook error:", err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}
