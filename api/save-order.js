import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderData } = req.body;
  const {
    SUPABASE_URL,
    VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  } = process.env;

  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;

  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Server configuration missing (Supabase credentials)' });
  }

  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  try {
    if (!orderData.selected_package) {
      return res.status(400).json({ message: "Missing selected_package" });
    }

    // Generate order number
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
    const randomStr = Math.random().toString(36).substring(2, 5); // 3 random chars
    const orderNumber = `GS-${dateStr}${randomStr}`;

    // Fetch price details so DB is fully populated for admin CMS.
    const { data: priceRow, error: priceError } = await supabase
      .from('pricelists')
      .select('*')
      .eq('servicename', orderData.selected_package)
      .single();

    if (priceError || !priceRow) {
      return res.status(400).json({
        message: 'Selected package not found in pricelists',
        error: priceError?.message,
      });
    }

    // Prepare order data
    const orderPayload = {
      order_number: orderNumber,
      full_name: orderData.name,
      phone_number: orderData.whatsapp,
      design_category: orderData.design_category || priceRow.category,
      selected_package: orderData.selected_package,
      brief_detail: orderData.brief,
      deadline: orderData.deadline,
      price: priceRow.finalprice ?? 0,
      discount_value: 0,
      discount_type: 'fixed',
      final_price: priceRow.finalprice ?? 0,
      source_order: 'web',
      status: 'DRAFT'
    };

    // Insert order
    const { data, error } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (error) {
      console.error('Error inserting order:', error);
      return res.status(500).json({ message: 'Failed to create order', error: error.message });
    }

    console.log('Order created successfully:', data);
    res.status(200).json({
      message: 'Order created successfully',
      order: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}