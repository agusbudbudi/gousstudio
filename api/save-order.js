import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Simple in-memory rate limiter per Serverless Function instance
const ipRequests = new Map();
function isRateLimited(ip) {
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5; // 5 orders per minute per IP
  const now = Date.now();
  if (!ipRequests.has(ip)) ipRequests.set(ip, []);
  
  const requests = ipRequests.get(ip).filter(t => now - t < windowMs);
  requests.push(now);
  ipRequests.set(ip, requests);
  return requests.length > maxRequests;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
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

    // Generate SECURE UNGUESSABLE order number
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const secureId = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 random hex chars
    const orderNumber = `GS-${dateStr}-${secureId}`;

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