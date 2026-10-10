import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { action } = req.query;
  const { SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;

  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Server configuration missing' });
  }

  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  switch (action) {
    case 'get-by-token':
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ message: 'Token is required' });

        // 1. Fetch Client
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('id, full_name, company, photo_url, magic_link_token')
          .eq('magic_link_token', token)
          .single();

        if (clientError || !client) {
          return res.status(404).json({ message: 'Invalid or expired magic link' });
        }

        // 2. Fetch all Orders for this client
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id, order_number, design_category, selected_package, 
            status, price, final_price, created_at, 
            payment_proof_url, deliverables_url, review_url
          `)
          .eq('client_id', client.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // 3. Fetch available vouchers for this client
        const { data: vouchers, error: vouchersError } = await supabase
          .from('referral_codes')
          .select('id, code, discount_value, discount_type, created_at')
          .eq('client_id', client.id)
          .eq('is_used', false)
          .order('created_at', { ascending: false });

        if (vouchersError) throw vouchersError;

        return res.status(200).json({
          success: true,
          client: {
            id: client.id,
            full_name: client.full_name,
            company: client.company,
            photo_url: client.photo_url
          },
          orders: orders || [],
          vouchers: vouchers || []
        });
      } catch (e) {
        return res.status(500).json({ message: e.message });
      }

    default:
      return res.status(400).json({ message: 'Invalid action' });
  }
}
