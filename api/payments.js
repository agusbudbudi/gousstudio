import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { action } = req.query;
  const { PAKASIR_API_KEY, VITE_PAKASIR_SLUG, SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;

  // Note: simulate-payment is in api/simulate-payment.js (dev-only, excluded via .vercelignore)

  switch (action) {
    case 'create-qris':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      const { order_id } = req.body || {};
      if (!order_id) return res.status(400).json({ message: 'Missing order_id' });

      try {
        const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

        // Properly capture error — .single() throws PGRST116 if 0 rows found
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('price, final_price')
          .eq('order_number', order_id)
          .single();

        if (orderError || !order) {
          return res.status(404).json({ message: 'Order not found', detail: orderError?.message });
        }

        const amount = order.final_price ?? order.price ?? 0;
        const response = await fetch('https://app.pakasir.com/api/transactioncreate/qris', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: VITE_PAKASIR_SLUG, order_id: String(order_id), amount, api_key: PAKASIR_API_KEY })
        });
        const resData = await response.json();
        if (!response.ok || !resData.payment) throw new Error(resData.message || 'Pakasir request failed');
        return res.status(200).json(resData.payment);
      } catch (e) { return res.status(500).json({ message: e.message }); }

    default:
      return res.status(400).json({ message: 'Invalid action' });
  }
}

