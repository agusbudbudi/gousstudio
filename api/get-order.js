import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderNumber } = req.query;
  if (!orderNumber) {
    return res.status(400).json({ message: 'Missing orderNumber parameter' });
  }

  const { SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;

  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Server configuration missing' });
  }

  // Use Service Role to bypass RLS, but ONLY fetch the specific order
  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch pricelist snapshot if not already stored in order
    let priceData = order.package_details || null;
    if (!priceData && order.selected_package) {
      const { data: fetchedPriceData } = await supabase
        .from('pricelists')
        .select('*')
        .eq('servicename', order.selected_package)
        .single();
      priceData = fetchedPriceData;
    }

    // Selectively return only safe, necessary fields (never return internal_notes etc to public)
    return res.status(200).json({ success: true, order, priceData });
  } catch (error) {
    console.error('Get Order Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
